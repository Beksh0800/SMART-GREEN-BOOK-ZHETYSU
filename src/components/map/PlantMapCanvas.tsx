"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap } from "leaflet";
import { Fragment, useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

import type { Plant, PlantLocation, Zone } from "@/lib/schema";

import {
  getPlantGroup,
  groupStyles,
  TILE_ATTRIBUTION,
  TILE_URL,
  uncertaintyRadiusM,
  ZHETYSU_CENTER,
  ZHETYSU_ZOOM,
} from "./mapStyle";
import { useCoarsePointer } from "./useCoarsePointer";
import { useTileMaxNativeZoom } from "./useTileMaxNativeZoom";

/** Что именно выбрано на карте: вид и конкретная его находка. */
export type MapSelection = { plant: Plant; location: PlantLocation };

/**
 * Карта всех находок. Точек порядка сотни — кластеризация не нужна,
 * а плагин markercluster тянет несовместимую с React 19 обвязку.
 */

/**
 * Отдаёт экземпляр карты наружу: кнопки масштаба и возврата к Жетісу живут
 * в панелях поверх карты, а не внутри неё, — иначе карточка выбранного вида
 * и панель фильтров их перекрывают.
 */
function MapReady({ onReady }: { onReady?: (map: LeafletMap) => void }) {
  const map = useMap();

  useEffect(() => {
    onReady?.(map);
  }, [map, onReady]);

  return null;
}

/** При выборе вида карта мягко подлетает к его первой точке. */
/**
 * Перелёт к выбранной находке.
 *
 * Раньше карта всегда летела к первой находке вида, а не к нажатой:
 * у видов с находками по всему Жетісу это выглядело как прыжок в другой
 * конец региона — человек нажимал точку на севере и оказывался под Алматы.
 */
function FlyToSelected({ selection }: { selection: MapSelection | null }) {
  const map = useMap();
  const lat = selection?.location.lat;
  const lon = selection?.location.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    map.flyTo([lat, lon], Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [lat, lon, map]);

  return null;
}

export function PlantMapCanvas({
  plants,
  zones,
  selected,
  onSelect,
  showZones,
  onReady,
}: {
  plants: Plant[];
  zones: Zone[];
  selected: MapSelection | null;
  onSelect: (selection: MapSelection) => void;
  showZones: boolean;
  onReady?: (map: LeafletMap) => void;
}) {
  // Точка под курсором подрастает: на карте с сотней меток это главный
  // сигнал, что метка кликабельна.
  const [hovered, setHovered] = useState<string | null>(null);
  const maxNativeZoom = useTileMaxNativeZoom();
  const touch = useCoarsePointer();

  return (
    <MapContainer
      center={ZHETYSU_CENTER}
      zoom={ZHETYSU_ZOOM}
      minZoom={6}
      maxZoom={14}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
      style={{ backgroundColor: "var(--color-paper-dim)" }}
    >
      {/*
        key перемонтирует слой при пропаже сети: react-leaflet не пробрасывает
        изменение maxNativeZoom в уже созданный TileLayer.
      */}
      <TileLayer
        key={maxNativeZoom ?? "online"}
        url={TILE_URL}
        // Без CORS ответ непрозрачен и в офлайн-кэш не попадает.
        crossOrigin="anonymous"
        attribution={TILE_ATTRIBUTION}
        maxNativeZoom={maxNativeZoom}
      />
      <MapReady onReady={onReady} />
      <FlyToSelected selection={selected} />

      {showZones &&
        zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lon]}
            radius={zone.radiusKm * 1000}
            pathOptions={{
              color: "#67765b",
              weight: 1,
              dashArray: "2 6",
              fillColor: "#67765b",
              fillOpacity: 0.05,
            }}
          >
            <Tooltip direction="center" className="!border-0 !bg-transparent !shadow-none">
              <span className="text-xs font-semibold text-forest-800">{zone.name.kk}</span>
            </Tooltip>
          </Circle>
        ))}

      {plants.map((plant) => {
        const color = groupStyles[getPlantGroup(plant)].color;
        const isSelected = selected?.plant.slug === plant.slug;
        /**
         * Когда вид выбран, остальные точки приглушаются. Их на карте больше
         * сотни, и без этого найти среди них находки выбранного вида нельзя —
         * а карточка рядом рассказывает именно про него.
         */
        const dimmed = selected !== null && !isSelected;

        return plant.locations.map((location) => {
          const zone = zones.find((z) => z.id === location.zoneId);
          const radius = uncertaintyRadiusM(location, zone);
          const key = `${plant.slug}-${location.lat}-${location.lon}`;
          // Находка, по которой нажали: у вида их бывает до десятка,
          // и понимать, о какой из них речь, нужно и на карте, и в карточке.
          const isActive =
            isSelected &&
            selected.location.lat === location.lat &&
            selected.location.lon === location.lon;

          return (
            <Fragment key={key}>
              {/* Круг неопределённости рисуем только у выбранного вида:
                  сотня полупрозрачных кругов сразу превращает карту в кашу.
                  Для остальных точность видна по пунктирному контуру точки. */}
              {radius !== null && isSelected && (
                <Circle
                  center={[location.lat, location.lon]}
                  radius={radius}
                  pathOptions={{
                    color,
                    weight: 1,
                    dashArray: "4 5",
                    fillColor: color,
                    fillOpacity: 0.1,
                  }}
                  eventHandlers={{ click: () => onSelect({ plant, location }) }}
                />
              )}
              {/*
                Мишень под палец. Видимая точка — шесть пикселей, попасть
                в неё на телефоне нельзя, а увеличивать её ради этого значит
                залить картой сотню жирных кругов. Поэтому поверх лежит
                прозрачный круг вчетверо шире: он ловит тап и ничего не рисует.
              */}
              {touch && (
                <CircleMarker
                  center={[location.lat, location.lon]}
                  radius={18}
                  pathOptions={{ stroke: false, fillOpacity: 0 }}
                  eventHandlers={{ click: () => onSelect({ plant, location }) }}
                />
              )}
              <CircleMarker
                center={[location.lat, location.lon]}
                radius={
                  isActive
                    ? 11
                    : isSelected
                      ? 9
                      : hovered === key
                        ? 8
                        : location.precision === "exact"
                          ? 6
                          : 5.5
                }
                pathOptions={{
                  color: isSelected ? "#22201c" : location.precision === "exact" ? "#ffffff" : color,
                  weight: isSelected ? 2.5 : 1.75,
                  dashArray: location.precision === "exact" ? undefined : "2 2",
                  fillColor: color,
                  // Приглушённые точки не исчезают совсем: общая картина
                  // распределения видов по региону — смысл этой карты.
                  opacity: dimmed ? 0.2 : 1,
                  fillOpacity: dimmed ? 0.12 : location.precision === "exact" ? 1 : 0.35,
                }}
                eventHandlers={{
                  click: () => onSelect({ plant, location }),
                  mouseover: () => setHovered(key),
                  mouseout: () => setHovered((h) => (h === key ? null : h)),
                }}
              >
                {/*
                  Подсказка — только для курсора. На сенсорном экране Leaflet
                  показывает её по тапу, и вместо карточки вида с переходом
                  в паспорт человек получал всплывающее название и тупик.
                */}
                {!touch && (
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span className="font-semibold">{plant.name.kk}</span>
                    <br />
                    <span className="italic">{plant.name.la}</span>
                  </Tooltip>
                )}
              </CircleMarker>
            </Fragment>
          );
        });
      })}
    </MapContainer>
  );
}

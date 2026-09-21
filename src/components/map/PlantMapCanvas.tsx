"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap } from "leaflet";
import { Fragment, useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

import type { Plant, Zone } from "@/lib/schema";

import {
  getPlantGroup,
  groupStyles,
  TILE_ATTRIBUTION,
  TILE_URL,
  uncertaintyRadiusM,
  ZHETYSU_CENTER,
  ZHETYSU_ZOOM,
} from "./mapStyle";
import { useTileMaxNativeZoom } from "./useTileMaxNativeZoom";

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
function FlyToSelected({ plant }: { plant: Plant | null }) {
  const map = useMap();

  useEffect(() => {
    if (!plant) return;
    const first = plant.locations[0];
    map.flyTo([first.lat, first.lon], Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [plant, map]);

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
  selected: Plant | null;
  onSelect: (plant: Plant) => void;
  showZones: boolean;
  onReady?: (map: LeafletMap) => void;
}) {
  // Точка под курсором подрастает: на карте с сотней меток это главный
  // сигнал, что метка кликабельна.
  const [hovered, setHovered] = useState<string | null>(null);
  const maxNativeZoom = useTileMaxNativeZoom();

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
        attribution={TILE_ATTRIBUTION}
        maxNativeZoom={maxNativeZoom}
      />
      <MapReady onReady={onReady} />
      <FlyToSelected plant={selected} />

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
        const isSelected = selected?.slug === plant.slug;

        return plant.locations.map((location) => {
          const zone = zones.find((z) => z.id === location.zoneId);
          const radius = uncertaintyRadiusM(location, zone);
          const key = `${plant.slug}-${location.lat}-${location.lon}`;

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
                  eventHandlers={{ click: () => onSelect(plant) }}
                />
              )}
              <CircleMarker
                center={[location.lat, location.lon]}
                radius={
                  isSelected
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
                  fillOpacity: location.precision === "exact" ? 1 : 0.35,
                }}
                eventHandlers={{
                  click: () => onSelect(plant),
                  mouseover: () => setHovered(key),
                  mouseout: () => setHovered((h) => (h === key ? null : h)),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <span className="font-semibold">{plant.name.kk}</span>
                  <br />
                  <span className="italic">{plant.name.la}</span>
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        });
      })}
    </MapContainer>
  );
}

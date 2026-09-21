"use client";

import "leaflet/dist/leaflet.css";

import { Fragment } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

import { precisionLabels } from "@/lib/labels";
import type { PlantLocation, Zone } from "@/lib/schema";

import { TILE_ATTRIBUTION, TILE_URL, uncertaintyRadiusM } from "./mapStyle";
import { useTileMaxNativeZoom } from "./useTileMaxNativeZoom";

/**
 * Небольшая карта находок одного вида — блок паспорта.
 * Точки с неточной привязкой рисуются пунктирным кругом,
 * чтобы не выдавать ареал за GPS-находку.
 */
export function MiniMap({
  locations,
  zones,
  color,
}: {
  locations: PlantLocation[];
  zones: Zone[];
  color: string;
}) {
  const maxNativeZoom = useTileMaxNativeZoom();

  /**
   * Рамка по всем находкам вида.
   *
   * Раньше карта центрировалась по среднему координат с постоянным зумом,
   * и у видов с разбросанными находками дальние просто не попадали в кадр:
   * у яблони Сиверса точка на Лепсі лежит в трёхстах километрах от
   * алматинских. Круги неточной привязки тоже учитываются — иначе половина
   * круга оказывалась срезанной краем карты.
   */
  const bounds: [[number, number], [number, number]] = (() => {
    let south = 90;
    let west = 180;
    let north = -90;
    let east = -180;

    for (const location of locations) {
      const zone = zones.find((z) => z.id === location.zoneId);
      const radiusM = uncertaintyRadiusM(location, zone) ?? 0;
      // Градус широты — около 111 км всюду, градус долготы сужается к полюсу.
      const dLat = radiusM / 111_000;
      const dLon = dLat / Math.max(Math.cos((location.lat * Math.PI) / 180), 0.01);

      south = Math.min(south, location.lat - dLat);
      north = Math.max(north, location.lat + dLat);
      west = Math.min(west, location.lon - dLon);
      east = Math.max(east, location.lon + dLon);
    }

    return [
      [south, west],
      [north, east],
    ];
  })();

  return (
    <MapContainer
      bounds={bounds}
      // Единственная находка без круга даёт рамку нулевого размера, и Leaflet
      // приблизился бы к ней вплотную; maxZoom оставляет вокруг окрестности.
      boundsOptions={{ padding: [26, 26], maxZoom: 10 }}
      scrollWheelZoom={false}
      attributionControl
      className="h-full w-full"
      style={{ backgroundColor: "var(--color-paper-dim)" }}
    >
      {/* key перемонтирует слой при пропаже сети — см. useTileMaxNativeZoom. */}
      <TileLayer
        key={maxNativeZoom ?? "online"}
        url={TILE_URL}
        // Без CORS ответ непрозрачен и в офлайн-кэш не попадает.
        crossOrigin="anonymous"
        attribution={TILE_ATTRIBUTION}
        maxNativeZoom={maxNativeZoom}
      />

      {locations.map((location) => {
        const zone = zones.find((z) => z.id === location.zoneId);
        const radius = uncertaintyRadiusM(location, zone);

        return (
          <Fragment key={`${location.zoneId}-${location.lat}-${location.lon}`}>
            {radius !== null && (
              <Circle
                center={[location.lat, location.lon]}
                radius={radius}
                pathOptions={{
                  color,
                  weight: 1,
                  dashArray: "4 4",
                  fillColor: color,
                  fillOpacity: 0.07,
                }}
              />
            )}
            <CircleMarker
              center={[location.lat, location.lon]}
              radius={location.precision === "exact" ? 7 : 5}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <span className="font-semibold">{location.label}</span>
                <br />
                {precisionLabels[location.precision].label}
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </MapContainer>
  );
}

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

  const center: [number, number] = [
    locations.reduce((sum, l) => sum + l.lat, 0) / locations.length,
    locations.reduce((sum, l) => sum + l.lon, 0) / locations.length,
  ];

  return (
    <MapContainer
      center={center}
      zoom={locations.length > 1 ? 7 : 9}
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

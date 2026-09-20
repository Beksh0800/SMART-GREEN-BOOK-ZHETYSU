import type { Metadata } from "next";

import { PlantMapView } from "@/components/map/PlantMapView";
import { getAllPlants, getAllZones } from "@/lib/plants";

export const metadata: Metadata = {
  title: "PlantMap — өсімдіктер картасы",
  description:
    "Жетісу өңірінің сирек кездесетін, эндемик және индикатор өсімдіктерінің интерактивті картасы: сүзгілер, аймақтар және цифрлық паспорттар.",
};

export default function MapPage() {
  return <PlantMapView plants={getAllPlants()} zones={getAllZones()} />;
}

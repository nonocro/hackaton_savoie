import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { LatLngLiteral } from "leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import type { LocationInfo } from "./adress-input";
import { useQuery } from "@tanstack/react-query";
import MarkerClusterGroup from "react-leaflet-markercluster";

import "leaflet/dist/leaflet.css";
// @ts-expect-error Import path is correct but typescript doesn't recognize it
import "react-leaflet-markercluster/styles";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  location?: LocationInfo;
  center?: LatLngLiteral;
}

// Chambéry
const DEFAULT_CENTER: LatLngLiteral = {
  lat: 45.56628,
  lng: 5.92079,
};

// Define interface for doctor data from API
interface Doctor {
  nom: string;
  adresse: string;
  longitude: number;
  latitude: number;
}

async function fetchAllDoctors(): Promise<Doctor[]> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/departements/73/medecins`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nearby doctors");
  }

  return response.json();
}

function ChangeView({ center }: { center: LatLngLiteral }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function DoctorsClusters({
  nearbyDoctors,
}: {
  nearbyDoctors: Doctor[] | undefined;
}) {
  const doctorIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [0, -33],
    className: "doctor-marker",
  });

  return (
    <MarkerClusterGroup chunkedLoading scrollWheelZoom showCoverageOnHover>
      {nearbyDoctors?.map((doctor, index) => (
        <Marker
          key={`doctor-${index}`}
          position={{ lat: doctor.latitude, lng: doctor.longitude }}
          icon={doctorIcon}
        >
          <Popup>
            <div>
              <p className="font-bold">{doctor.nom}</p>
              <p className="text-sm">{doctor.adresse}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}

export function MapComponent({ location }: Readonly<MapComponentProps>) {
  const [center, setCenter] = useState(DEFAULT_CENTER);

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchAllDoctors(),
  });

  useEffect(() => {
    setCenter(
      location
        ? { lat: location.latitude, lng: location.longitude }
        : DEFAULT_CENTER
    );
  }, [location]);

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "80%" }}
    >
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DoctorsClusters nearbyDoctors={doctors} />
    </MapContainer>
  );
}

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";

interface MapComponentProps {
  center?: LatLngExpression;
}

// Chambéry coordinates
const DEFAULT_CENTER: LatLngExpression = {
  lat: 45.5649,
  lng: 6.0992,
};

export function MapComponent(props: Readonly<MapComponentProps>) {
  const [center, setCenter] = useState(DEFAULT_CENTER);

  useEffect(() => {
    setCenter(props.center ?? DEFAULT_CENTER);
  }, [props.center]);

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

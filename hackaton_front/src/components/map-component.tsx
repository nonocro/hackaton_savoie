import { MapContainer, TileLayer, useMap, Marker, Popup, Polygon } from "react-leaflet";
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
  isochroneTime?: number; // in seconds
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

function DoctorsClusters({ doctors }: { doctors: Doctor[] | undefined }) {
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
      {doctors?.map((doctor, index) => (
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

type IsochroneParams = {
  lon: number;
  lat: number;
  isochroneTime?: number; // in seconds
};

type GeoJSONPolygon = {
  type: string;
  coordinates: number[][][];
};

type IsochroneResponse = {
  geometry: GeoJSONPolygon;
};

export async function fetchIsochrone({ lon, lat, isochroneTime }: IsochroneParams): Promise<number[][] | null> {
  console.log("Fetching isochrone for:", lon, lat, isochroneTime);
  const apiUrl = "https://data.geopf.fr/navigation/isochrone";
  const body = {
    resource: "bdtopo-valhalla",
    profile: "car",
    costType: "time",
    costValue: String(isochroneTime),
    direction: "departure",
    point: `${lon},${lat}`,
    geometryFormat: "geojson",
    crs: "EPSG:4326",
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Isochrone error]", response.status, errorText);
      return null;
    }

    const data: IsochroneResponse = await response.json();

    if (
      data?.geometry?.type === "Polygon" &&
      Array.isArray(data.geometry.coordinates) &&
      data.geometry.coordinates[0]
    ) {
      // Return the first (outer) ring coordinates – [ [lng, lat], ... ]
      return data.geometry.coordinates[0];
    } else {
      console.error("Isochrone response missing coordinates:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching isochrone:", error);
    return null;
  }
}



// --- Map click handler which calls fetchIsochrone and updates state ---
function MapClickHandler({
  onIsochrone,
  isochroneTime,
}: {
  onIsochrone: (coords: number[][] | null, center: LatLngLiteral) => void;
  isochroneTime: number;
}) {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      fetchIsochrone({ lon: lng, lat, isochroneTime })
        .then((coords) => onIsochrone(coords, { lat, lng }))
        .catch(() => onIsochrone(null, { lat, lng }));
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onIsochrone, isochroneTime]);
  return null;
}


// ---------------- MAIN COMPONENT ------------------
export function MapComponent({ location, isochroneTime }: Readonly<MapComponentProps>) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isochrone, setIsochrone] = useState<number[][] | null>(null);

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchAllDoctors(),
  });

  // When location changes (from address search), auto-fetch isochrone
  useEffect(() => {
    setCenter(
      location
        ? { lat: location.latitude, lng: location.longitude }
        : DEFAULT_CENTER
    );
    if (location?.longitude && location?.latitude) {
      fetchIsochrone({
        lon: location.longitude,
        lat: location.latitude,
        isochroneTime: isochroneTime
      })
        .then(coords => setIsochrone(coords))
        .catch(() => setIsochrone(null));
    } else {
      setIsochrone(null);
    }
  }, [location, isochroneTime]);

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

      {/* Enable click handler for isochrone on map click */}
      <MapClickHandler
        onIsochrone={(coords, newCenter) => {
          setIsochrone(coords);
          setCenter(newCenter);
        }}
        isochroneTime={isochroneTime ?? 300} // fallback to 5 min if undefined
      />

      <DoctorsClusters doctors={doctors} />

      {isochrone && (
        <Polygon
          positions={isochrone.map(([lng, lat]) => [lat, lng])}
          pathOptions={{ color: "blue", fillOpacity: 0.2, weight: 2 }}
        />
      )}
    </MapContainer>
  );
}

import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";
import type { LatLngLiteral, LatLngExpression } from "leaflet";
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

interface Doctor {
  nom: string;
  adresse: string;
  longitude: number;
  latitude: number;
  code_insee: string;
}

interface Commune {
  code_insee: string;
  nom_standard: string;
  dep_code: string;
  dep_nom: string;
  population: number;
  latitude_centre: number;
  longitude_centre: number;
  polygone: [number, number][];
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

async function fetchAllCommunes(): Promise<Commune[]> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/departements/73/communes`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch communes data");
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

function CommunePolygons({
  communes,
  doctors,
}: {
  communes: Commune[] | undefined;
  doctors: Doctor[] | undefined;
}) {
  const interpolateColor = (
    color1: [number, number, number],
    color2: [number, number, number],
    factor: number
  ): string => {
    const result = color1.map((c, i) =>
      Math.round(c + factor * (color2[i] - c))
    );

    return `rgba(${result[0]}, ${result[1]}, ${result[2]}, 0.6)`;
  };

  const communeColors = useMemo(() => {
    if (!communes || !doctors) return {};

    const doctorCounts: Record<string, number> = {};
    doctors.forEach((doctor) => {
      const codeInsee = doctor.code_insee;
      if (codeInsee) {
        doctorCounts[codeInsee] = (doctorCounts[codeInsee] || 0) + 1;
      }
    });

    const colors: Record<string, string> = {};

    // Target ratio: 1 doctor per 1400 residents = 0.71 doctors per 1000 residents
    const targetRatio = 0.71;
    const maxRatio = targetRatio * 2;

    const colorStops: [number, number, number][] = [
      [220, 50, 50], // Red for low coverage (below 50% of target)
      [252, 196, 25], // Yellow for medium coverage (at target)
      [42, 145, 52], // Green for high coverage (above target)
    ];

    communes.forEach((commune) => {
      const doctorCount = doctorCounts[commune.code_insee] || 0;

      if (commune.population <= 0) {
        colors[commune.code_insee] = "rgba(100, 100, 100, 0.5)";
      } else if (doctorCount === 0) {
        colors[commune.code_insee] = "rgba(180, 0, 0, 0.6)";
      } else {
        const ratio = (doctorCount / commune.population) * 1000;
        let normalizedRatio;

        if (ratio < targetRatio) {
          normalizedRatio = (ratio / targetRatio) * 0.5;
        } else {
          normalizedRatio =
            0.5 +
            Math.min(
              0.5,
              ((ratio - targetRatio) / (maxRatio - targetRatio)) * 0.5
            );
        }

        if (normalizedRatio < 0.5) {
          const segmentFactor = normalizedRatio * 2;
          colors[commune.code_insee] = interpolateColor(
            colorStops[0],
            colorStops[1],
            segmentFactor
          );
        } else {
          const segmentFactor = (normalizedRatio - 0.5) * 2;
          colors[commune.code_insee] = interpolateColor(
            colorStops[1],
            colorStops[2],
            segmentFactor
          );
        }
      }
    });

    return colors;
  }, [communes, doctors]);

  const legend = useMemo(() => {
    const gradientStyle = {
      background:
        "linear-gradient(to right, rgb(220, 50, 50), rgb(252, 196, 25), rgb(42, 145, 52))",
      height: "20px",
      width: "200px",
      margin: "5px 0",
      border: "1px solid #ccc",
      borderRadius: "2px",
    };

    return (
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>
          Doctor Coverage (Target: 1 doctor per 1400 residents)
        </div>
        <div style={gradientStyle}></div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
          }}
        >
          <span>Below Target</span>
          <span>Target</span>
          <span>Above Target</span>
        </div>
        <div style={{ fontSize: "11px", marginTop: "5px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                backgroundColor: "rgba(180, 0, 0, 0.6)",
                marginRight: "5px",
              }}
            ></span>
            <span>No doctors</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                backgroundColor: "rgba(100, 100, 100, 0.5)",
                marginRight: "5px",
              }}
            ></span>
            <span>No population data</span>
          </div>
        </div>
      </div>
    );
  }, []);

  if (!communes || communes.length === 0) {
    return null;
  }

  return (
    <>
      {communes.map((commune) => {
        const polygonCoords: LatLngExpression[] = commune.polygone.map(
          ([lat, lng]) => [lat, lng]
        );

        if (polygonCoords.length === 0) return null;

        const doctorCount =
          doctors?.filter((d) => d.code_insee === commune.code_insee).length ||
          0;
        const doctorsPerThousand = commune.population
          ? ((doctorCount / commune.population) * 1000).toFixed(2)
          : "N/A";

        return (
          <Polygon
            key={commune.code_insee}
            positions={polygonCoords}
            pathOptions={{
              color: "#333",
              weight: 1,
              fillColor:
                communeColors[commune.code_insee] || "rgba(0, 0, 255, 0.1)",
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div>
                <p className="font-bold">{commune.nom_standard}</p>
                <p className="text-sm">
                  Population: {commune.population.toLocaleString()}
                </p>
                <p className="text-sm">Doctors: {doctorCount}</p>
                <p className="text-sm">
                  Doctors per 1000 residents: {doctorsPerThousand}
                </p>
                <p className="text-sm">
                  {doctorCount > 0 && commune.population > 0
                    ? `1 doctor per ${Math.round(
                        commune.population / doctorCount
                      ).toLocaleString()} residents`
                    : "No doctor coverage"}
                </p>
              </div>
            </Popup>
          </Polygon>
        );
      })}
      {legend}
    </>
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
      map.closePopup();

      const { lat, lng } = e.latlng;
      fetchIsochrone({ lon: lng, lat, isochroneTime })
        .then((coords) => onIsochrone(coords, { lat, lng }))
        .catch(() => onIsochrone(null, { lat, lng }));
    };
    map.on("dblclick", handleClick);
    return () => {
      map.off("dblclick", handleClick);
    };
  }, [map, onIsochrone, isochroneTime]);
  return null;
}

export function MapComponent({ location, isochroneTime }: Readonly<MapComponentProps>) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isochrone, setIsochrone] = useState<number[][] | null>(null);

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchAllDoctors(),
  });

  const { data: communes } = useQuery({
    queryKey: ["communes"],
    queryFn: () => fetchAllCommunes(),
  });

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

      <CommunePolygons communes={communes} doctors={doctors} />
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

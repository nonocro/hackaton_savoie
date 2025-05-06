import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo, type ReactNode } from "react";
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
  isochroneTime?: number;
  saisonTime: string;
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
  populationEte: number;
  populationHiver: number;
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

function DoctorsClusters({
  doctors,
  isIsochroneActive,
}: {
  doctors: Doctor[] | undefined;
  isIsochroneActive: boolean;
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
    <MarkerClusterGroup
      chunkedLoading
      scrollWheelZoom
      showCoverageOnHover
      className={isIsochroneActive ? "isochrone-mode-markers" : ""}
    >
      {doctors?.map((doctor, index) => (
        <Marker
          key={`doctor-${index}`}
          position={{ lat: doctor.latitude, lng: doctor.longitude }}
          icon={doctorIcon}
          interactive={!isIsochroneActive}
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
  saison,
  isIsochroneActive,
}: {
  communes: Commune[] | undefined;
  doctors: Doctor[] | undefined;
  saison: string;
  isIsochroneActive: boolean;
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

    const badRatio = 2.5; // Below this is bad (red)
    const goodRatio = 3.5; // Above this is good (green)
    const idealRatio = 4.0; // Ideal coverage (dark green)

    const colorStops: [number, number, number][] = [
      [204, 0, 0], // Dark red - critical shortage
      [255, 51, 51], // Red - significant shortage
      [255, 128, 51], // Orange - concerning
      [255, 204, 51], // Yellow - borderline
      [153, 204, 0], // Light green - acceptable
      [51, 153, 51], // Green - good
      [0, 102, 51], // Dark green - excellent
    ];

    communes.forEach((commune) => {
      const doctorCount = doctorCounts[commune.code_insee] || 0;
      let population = commune.population;

      switch (saison) {
        case "ETE":
          population = commune.populationEte;
          break;
        case "HIVER":
          population = commune.populationHiver;
          break;
        default:
          break;
      }

      if (population <= 0) {
        colors[commune.code_insee] = "rgba(100, 100, 100, 0.5)";
      } else if (doctorCount === 0) {
        colors[commune.code_insee] = "rgba(180, 0, 0, 0.6)";
      } else {
        const ratio = (doctorCount / population) * 1000; // Doctors per 1000 residents

        if (ratio <= 0) {
          colors[
            commune.code_insee
          ] = `rgba(${colorStops[0][0]}, ${colorStops[0][1]}, ${colorStops[0][2]}, 0.6)`;
        } else if (ratio < badRatio * 0.5) {
          const factor = ratio / (badRatio * 0.5);
          colors[commune.code_insee] = interpolateColor(
            colorStops[0],
            colorStops[1],
            factor
          );
        } else if (ratio < badRatio) {
          const factor = (ratio - badRatio * 0.5) / (badRatio * 0.5);
          colors[commune.code_insee] = interpolateColor(
            colorStops[1],
            colorStops[2],
            factor
          );
        } else if (ratio < (badRatio + goodRatio) / 2) {
          const factor = (ratio - badRatio) / ((goodRatio - badRatio) / 2);
          colors[commune.code_insee] = interpolateColor(
            colorStops[2],
            colorStops[3],
            factor
          );
        } else if (ratio < goodRatio) {
          const factor =
            (ratio - (badRatio + goodRatio) / 2) / ((goodRatio - badRatio) / 2);
          colors[commune.code_insee] = interpolateColor(
            colorStops[3],
            colorStops[4],
            factor
          );
        } else if (ratio < idealRatio) {
          const factor = (ratio - goodRatio) / (idealRatio - goodRatio);
          colors[commune.code_insee] = interpolateColor(
            colorStops[4],
            colorStops[5],
            factor
          );
        } else {
          const cappedRatio = Math.min(ratio, idealRatio * 1.5);
          const factor = (cappedRatio - idealRatio) / (idealRatio * 0.5);
          colors[commune.code_insee] = interpolateColor(
            colorStops[5],
            colorStops[6],
            Math.min(1, factor)
          );
        }
      }
    });

    return colors;
  }, [communes, doctors, saison]);

  const legend = useMemo(() => {
    const gradientStyle = {
      background:
        "linear-gradient(to right, rgb(204, 0, 0), rgb(255, 51, 51), rgb(255, 128, 51), rgb(255, 204, 51), rgb(153, 204, 0), rgb(51, 153, 51), rgb(0, 102, 51))",
      height: "20px",
      width: "240px",
      margin: "5px 0",
      border: "1px solid #ccc",
      borderRadius: "2px",
    };

    const markerPositions = [
      { value: 0, label: "0" },
      { value: 2.5, label: "2.5" },
      { value: 3.5, label: "3.5" },
      { value: 4.0, label: "4.0" },
    ];

    const maxValue = 5.0;
    const markers = markerPositions.map((marker) => ({
      ...marker,
      percent: (marker.value / maxValue) * 100,
    }));

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
          Médecins pour 1000 habitants
        </div>
        <div style={{ position: "relative" }}>
          <div style={gradientStyle}></div>
          <div
            style={{ position: "relative", height: "15px", marginTop: "2px" }}
          >
            {markers.map((marker) => (
              <div
                key={marker.value}
                style={{
                  position: "absolute",
                  left: `${marker.percent}%`,
                  transform: "translateX(-50%)",
                  fontSize: "9px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    height: "5px",
                    width: "1px",
                    backgroundColor: "#333",
                    margin: "0 auto 2px",
                  }}
                ></div>
                {marker.label}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            marginTop: "5px",
          }}
        >
          <span>Critique</span>
          <span>Sous la norme</span>
          <span>Bon</span>
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
            <span>Aucun médecin</span>
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
            <span>Aucune donnée de population</span>
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

        let coverageStatus = "";
        if (doctorCount === 0) {
          coverageStatus = "Aucune couverture";
        } else if (commune.population <= 0) {
          coverageStatus = "Aucune donnée de population";
        } else {
          const ratio = (doctorCount / commune.population) * 1000;
          if (ratio < 2.5) {
            coverageStatus = "Couverture en dessous des normes";
          } else if (ratio < 3.5) {
            coverageStatus = "Couverture adéquate";
          } else {
            coverageStatus = "Bonne couverture";
          }
        }

        return (
          <Polygon
            key={commune.code_insee}
            positions={polygonCoords}
            pathOptions={{
              color: "#333",
              weight: 1,
              fillColor:
                communeColors[commune.code_insee] || "rgba(0, 0, 255, 0.1)",
              fillOpacity: isIsochroneActive ? 0.4 : 0.7,
            }}
            interactive={!isIsochroneActive}
          >
            {!isIsochroneActive && (
              <Popup>
                <div>
                  <p className="font-bold">{commune.nom_standard}</p>
                  <p className="text-sm">
                    Population: {commune.population.toLocaleString()}
                  </p>
                  <p className="text-sm">Médecins: {doctorCount}</p>
                  <p className="text-sm">
                    Médecins pour 1000 habitants: {doctorsPerThousand}
                  </p>
                  <p className="text-sm">
                    {doctorCount > 0 && commune.population > 0
                      ? `1 médecin pour ${Math.round(
                          commune.population / doctorCount
                        ).toLocaleString()} habitants`
                      : "Aucune couverture médicale"}
                  </p>
                  <p className="text-sm font-medium">
                    Statut: {coverageStatus}
                  </p>
                </div>
              </Popup>
            )}
          </Polygon>
        );
      })}
      {!isIsochroneActive && legend}
    </>
  );
}

type IsochroneParams = {
  lon: number;
  lat: number;
  isochroneTime?: number;
};

type GeoJSONPolygon = {
  type: string;
  coordinates: number[][][];
};

type IsochroneResponse = {
  geometry: GeoJSONPolygon;
};

export async function fetchIsochrone({
  lon,
  lat,
  isochroneTime,
}: IsochroneParams): Promise<number[][] | null> {
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

function IsochroneClickHandler({
  onIsochrone,
  isochroneTime,
  isActive,
  children,
}: {
  onIsochrone: (coords: number[][] | null, center: LatLngLiteral) => void;
  isochroneTime: number;
  isActive: boolean;
  children: ReactNode;
}) {
  const map = useMap();

  useEffect(() => {
    if (isActive) {
      map.closePopup();

      map.getContainer().classList.add("isochrone-mode");

      const style = document.createElement("style");
      style.id = "isochrone-mode-style";
      style.innerHTML = `
        .isochrone-mode .leaflet-popup-pane {
          pointer-events: none;
        }
        .isochrone-mode .leaflet-popup {
          opacity: 0.4;
        }
      `;
      document.head.appendChild(style);
    } else {
      map.getContainer().classList.remove("isochrone-mode");

      const styleElement = document.getElementById("isochrone-mode-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    }

    return () => {
      // Cleanup
      map.getContainer().classList.remove("isochrone-mode");
      const styleElement = document.getElementById("isochrone-mode-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isActive, map]);

  useMapEvents({
    click(e) {
      if (!isActive) return;

      map.closePopup();

      fetchIsochrone({ lon: e.latlng.lng, lat: e.latlng.lat, isochroneTime })
        .then((coords) => {
          onIsochrone(coords, { lat: e.latlng.lat, lng: e.latlng.lng });
        })
        .catch((error) => {
          console.error("Error fetching isochrone", error);
        });
    },
  });

  return <>{children}</>;
}

function IsochroneControl({
  onActivate,
  isActive,
  isochroneTime,
}: {
  onActivate: (active: boolean) => void;
  isActive: boolean;
  isochroneTime: number;
}) {
  return (
    <div
      className="leaflet-control leaflet-bar"
      style={{
        position: "absolute",
        top: "80px",
        right: "10px",
        zIndex: 1000,
        backgroundColor: "white",
        padding: "5px",
        borderRadius: "4px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{ marginBottom: "5px", fontSize: "12px", fontWeight: "bold" }}
      >
        Zone d'accessibilité
      </div>
      <button
        onClick={() => onActivate(!isActive)}
        style={{
          backgroundColor: isActive ? "#3388ff" : "white",
          color: isActive ? "white" : "black",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "6px 10px",
          cursor: "pointer",
          fontSize: "12px",
          width: "100%",
          marginBottom: "6px",
        }}
        title={
          isActive
            ? "Désactiver"
            : "Cliquez pour activer le mode isochrone, puis cliquez sur la carte"
        }
      >
        {isActive ? "Désactiver" : "Activer"}
      </button>
      <div style={{ fontSize: "11px", marginBottom: "3px" }}>
        {isActive
          ? "Cliquez n'importe où sur la carte pour afficher la zone de temps de trajet"
          : `Temps de trajet: ${Math.floor(isochroneTime / 60)} minutes`}
      </div>
      {isActive && (
        <div style={{ fontSize: "10px", color: "#666" }}>
          Cliquez sur la carte pour créer une zone de temps de trajet
        </div>
      )}
    </div>
  );
}

export function MapComponent({
  location,
  isochroneTime,
  saisonTime,
}: Readonly<MapComponentProps>) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isochrone, setIsochrone] = useState<number[][] | null>(null);
  const [isochroneActive, setIsochroneActive] = useState(false);
  const [isochroneCenter, setIsochroneCenter] = useState<LatLngLiteral | null>(
    null
  );

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchAllDoctors(),
  });

  const { data: communes } = useQuery({
    queryKey: ["communes"],
    queryFn: () => fetchAllCommunes(),
  });

  useEffect(() => {
    if (location) {
      setCenter({ lat: location.latitude, lng: location.longitude });
      fetchIsochrone({
        lon: location.longitude,
        lat: location.latitude,
        isochroneTime: isochroneTime ?? 300,
      })
        .then((coords) => {
          setIsochrone(coords);
          setIsochroneCenter({
            lat: location.latitude,
            lng: location.longitude,
          });
        })
        .catch(() => {
          setIsochrone(null);
          setIsochroneCenter(null);
        });
    }
  }, [location]);

  useEffect(() => {
    if (isochroneCenter && isochroneTime) {
      fetchIsochrone({
        lon: isochroneCenter.lng,
        lat: isochroneCenter.lat,
        isochroneTime,
      })
        .then((coords) => {
          setIsochrone(coords);
        })
        .catch(() => {
          setIsochrone(null);
        });
    }
  }, [isochroneTime, isochroneCenter]);

  const handleIsochroneUpdate = (
    coords: number[][] | null,
    newCenter: LatLngLiteral
  ) => {
    setIsochrone(coords);
    setIsochroneCenter(newCenter);
    setCenter(newCenter);
  };

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

      {/* Isochrone interaction components */}
      <IsochroneClickHandler
        onIsochrone={handleIsochroneUpdate}
        isochroneTime={isochroneTime ?? 300}
        isActive={isochroneActive}
      >
        <IsochroneControl
          onActivate={setIsochroneActive}
          isActive={isochroneActive}
          isochroneTime={isochroneTime ?? 300}
        />
      </IsochroneClickHandler>

      <CommunePolygons
        communes={communes}
        doctors={doctors}
        saison={saisonTime}
        isIsochroneActive={isochroneActive}
      />
      <DoctorsClusters doctors={doctors} isIsochroneActive={isochroneActive} />

      {isochrone && (
        <Polygon
          positions={isochrone.map(([lng, lat]) => [lat, lng])}
          pathOptions={{
            color: "#3388ff",
            fillColor: "#3388ff",
            fillOpacity: 0.2,
            weight: 3,
            dashArray: "5, 5",
          }}
        />
      )}

      {isochroneCenter && (
        <Marker
          position={isochroneCenter}
          icon={L.divIcon({
            html: `<div style="background-color: #3388ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            className: "isochrone-center-marker",
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })}
        />
      )}
    </MapContainer>
  );
}

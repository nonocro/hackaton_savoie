require("dotenv").config();
const cors = require("cors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const port = 5000;
const app = express();

app.use(cors());

// Load Swagger doc
const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Dummy data
const communes = [
  {
    nom: "Aiguebelette-le-Lac",
    code: "73001",
    codeDepartement: "73",
    siren: "217300011",
    codeEpci: "247300668",
    codeRegion: "84",
    codesPostaux: ["73610"],
    population: 247,
  },
  {
    nom: "Chambéry",
    code: "73065",
    codeDepartement: "73",
    siren: "217300065",
    codeEpci: "247300489",
    codeRegion: "84",
    codesPostaux: ["73000", "73011", "73012"],
    population: 58839,
  },
  {
    nom: "Aix-les-Bains",
    code: "73008",
    codeDepartement: "73",
    siren: "217300008",
    codeEpci: "247300522",
    codeRegion: "84",
    codesPostaux: ["73100"],
    population: 30790,
  },
  {
    nom: "Albertville",
    code: "73011",
    codeDepartement: "73",
    siren: "217300011",
    codeEpci: "247300546",
    codeRegion: "84",
    codesPostaux: ["73200"],
    population: 19133,
  },
  {
    nom: "Saint-Jean-de-Maurienne",
    code: "73248",
    codeDepartement: "73",
    siren: "217302048",
    codeEpci: "247300490",
    codeRegion: "84",
    codesPostaux: ["73300"],
    population: 7915,
  },
];

const medecins = [
  {
    nom: "Dr Jean Dupont",
    adresse: "13 rue du grand BAC 73125 Chambéry",
  },
  {
    nom: "Dr Claire Martin",
    adresse: "20 avenue de la Gare 73200 Albertville",
  },
  {
    nom: "Dr Pierre Morel",
    adresse: "5 rue de Genève 73100 Aix-les-Bains",
  },
  {
    nom: "Dr Sophie Lacroix",
    adresse: "42 boulevard de la Colonne 73000 Chambéry",
  },
  {
    nom: "Dr Paul Simon",
    adresse: "8 chemin des Écoles 73300 Saint-Jean-de-Maurienne",
  },
];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ---- 1. Liste des communes du département 73
app.get("/departements/73/communes", async (req, res) => {
  let response;

  if (process.env.BDJSON) {
    response = await fetch("http://localhost:3001/communes");
  } else {
    const url = "https://geo.api.gouv.fr/departements/73/communes";
    response = await fetch(url);
  }

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }

  const data = await response.json();
  return res.json(data);
});

// ---- 2. Liste des médecins du département 73
app.get("/departements/73/medecins", async (req, res) => {
  const url =
    "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/medecins/records?where=dep_code%3D73&limit=100&refine=libelle_profession%3A%22M%C3%A9decin%20g%C3%A9n%C3%A9raliste%22";

  const response = await fetch(url);
  const data = await response.json();

  const medecinsReponse = data.results.map((medecin) => ({
    nom: medecin.nom,
    adresse: medecin.adresse,
    longitude: medecin.coordonnees.lon,
    latitude: medecin.coordonnees.lat,
  }));

  res.json(medecinsReponse);
});

// ---- 3. Endpoint pour la population d'une commune par code INSEE
app.get("/departements/73/communes/:code", async (req, res) => {
  const { code } = req.params;
  const url = "https://geo.api.gouv.fr/communes/" + code;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }

  const data = await response.json();
  return res.json(data);
});

// ---- 4. Recherche des médecins proches des coordonnées (mock)
app.get("/recherche/medecins", async (req, res) => {
  const { lat, lon } = req.query;
  // contrôle de la présence et de la validité des coordonnées
  if (!lat || !lon || isNaN(+lat) || isNaN(+lon)) {
    return res.status(400).json({ message: "Coordonnées invalides" });
  }

  const url =
    "https://nominatim.openstreetmap.org/reverse?lat=" +
    lat +
    "&lon=" +
    lon +
    "&format=json";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }
  const nearestPlace = await response.json();

  const urlMedecin =
    "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/medecins/records?where=dep_code%3D73%20AND%20adresse%20like%20%27" +
    nearestPlace.address.postcode +
    "%27&limit=100&refine=libelle_profession%3A%22M%C3%A9decin%20g%C3%A9n%C3%A9raliste%22";

  const responseMedecin = await fetch(urlMedecin);
  const data = await responseMedecin.json();

  const medecins = data.results.map((medecin) => ({
    nom: medecin.nom,
    adresse: medecin.adresse,
    longitude: medecin.coordonnees.lon,
    latitude: medecin.coordonnees.lat,
  }));

  res.json(medecins);
});

module.exports = app;

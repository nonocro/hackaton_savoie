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

// ---- 2. Liste des médecins du département 73, filtable par codePostal
app.get('/departements/73/medecins', async (req, res) => {
  const { codePostal } = req.query;

  if (!process.env.BDJSON) 
  {
    const url = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/medecins/records?where=dep_code%3D73%20AND%20adresse%20like%20%27" + codePostal + "%27&limit=100&refine=libelle_profession%3A%22M%C3%A9decin%20g%C3%A9n%C3%A9raliste%22";

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  }
  else 
  {
    const response = await fetch("http://localhost:3001/medecins");
    const data = await response.json();
  
    // Si le code postal est vide on renvoit toutes les données
    if(codePostal == "" || codePostal == undefined || codePostal == null)
    {
      const medecinsReponse = data.map(medecin => 
      ({
          nom: medecin.nom,
          adresse: medecin.adresse
        })
      );

      return res.json(medecinsReponse);
    }

    const medecinsReponse = [];
    const regex = new RegExp(`\\b${codePostal}\\b`);

    for (let i = 0; i < data.length; i++) {
      const medecin = data[i];
      
      if (regex.test(medecin.adresse)) {
        medecinsReponse.push({
          nom: medecin.nom,
          adresse: medecin.adresse
        });
      }
    }
      
    return res.json(medecinsReponse);
  }
});

// ---- 3. Endpoint pour la population d'une commune par code INSEE
app.get('/departements/73/communes/:code', async (req, res) => {

  if (process.env.BDJSON) 
  {
    const { code } = req.params;
    const response = await fetch('http://localhost:3001/communes');
    const data = await response.json();

    const communesReponse = [];
    const regex = new RegExp(`\\b${code}\\b`);

    for (let i = 0; i < data.length; i++) {
      const commune = data[i];
      if (regex.test(commune.code)) {
        communesReponse.push(commune);
      }
    }
      
    return res.json(communesReponse);
  }
  else 
  {
    const { code } = req.params;
    const url = "https://geo.api.gouv.fr/communes/" + code;
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
  
    const data = await response.json();
    return res.json(data)
  }
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

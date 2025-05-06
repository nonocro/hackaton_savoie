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
    /*const url = "https://geo.api.gouv.fr/departements/73/communes";
    response = await fetch(url); */

    response = await fetch("http://localhost:3001/communes");
  }

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }
  
  const data = await response.json();

  const tourismesData = await fetch("http://localhost:3001/tourisme");
  const tourismes = await tourismesData.json();
  for (let i = 0; i < data.length; i++) {
    const commune = data[i];
    let type = tourismes.find((t) => {
      return t.com_code_source == commune.code_insee
    });
    type = type ?? {com_tourism_type:""};
    switch (type.com_tourism_type)
    {
      case "Commune touristique":
        commune.populationHiver = commune.population;
        commune.populationEte = commune.population * 10;
        break;
        case "Station classée de tourisme":
        commune.populationHiver = commune.population * 10;
        commune.populationEte = commune.population;
        break;
      default:
        commune.populationHiver = commune.population;
        commune.populationEte = commune.population;
        break;
    }
  }

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
          adresse: medecin.adresse,
          longitude: medecin.coordonnees.lon,
          latitude: medecin.coordonnees.lat,
          code_insee: medecin.code_insee,
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
          adresse: medecin.adresse,
          longitude: medecin.coordonnees.lon,
          latitude: medecin.coordonnees.lat,
          code_insee: medecin.code_insee,
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
    code_insee: medecin.code_insee,
  }));

  res.json(medecins);
});

// ---- 5. Taux de médecins par habitant dans le département 73 (par commune ou global)
app.get("/departements/73/nombre-habitant-par-medecin/:code?", async (req, res) => {
  const { code } = req.query;
  let population = 0;
  let medecinsCount = 0;

  if (code) {
    // ----- CAS AVEC CODE COMMUNE 
    let postalCode = "";
    if (process.env.BDJSON) {
      const response = await fetch("http://localhost:3001/communes");
      const communes = await response.json();
      const commune = communes.find((c) => c.code === code);
      if (!commune) return res.status(404).json({ error: "Commune non trouvée" });
      population = commune.population;
      postalCode = commune.codesPostaux[0];
      // Médecins pour la commune
      const responseMed = await fetch("http://localhost:3001/medecins");
      const medecins = await responseMed.json();
      medecinsCount = medecins.filter((m) => m.code_insee === code).length;
    } else {
      const urlCommune = `https://geo.api.gouv.fr/communes/${code}`;
      const response = await fetch(urlCommune);
      if (!response.ok) return res.status(404).json({ error: "Commune non trouvée" });
      const data = await response.json();
      population = data.population;
      postalCode = data.codesPostaux[0];
      // Médecins pour la commune
      const urlMedecin = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/medecins/records?where=dep_code%3D73%20AND%20code_insee%3D%27${code}%27&limit=100&refine=libelle_profession%3A%22M%C3%A9decin%20g%C3%A9n%C3%A9raliste%22`;
      const responseMed = await fetch(urlMedecin);
      if (!responseMed.ok) return res.status(500).json({ error: "Erreur récupération médecins" });
      const dataMed = await responseMed.json();
      medecinsCount = dataMed.results.length;
    }
  } else {
    // ----- CAS GLOBAL SANS CODE : somme sur tout le département
    if (process.env.BDJSON) {
      const responseComm = await fetch("http://localhost:3001/communes");
      const communes = await responseComm.json();
      population = communes.reduce((sum, c) => sum + (c.population || 0), 0);
      const responseMed = await fetch("http://localhost:3001/medecins");
      const medecins = await responseMed.json();
      // Uniquement médecins du 73 si jamais il y a d'autres départements dans le mock
      medecinsCount = medecins.filter(m => m.dep_code === "73").length;
    } else {
      const urlCommunes = "https://geo.api.gouv.fr/departements/73/communes?fields=population";
      const responseComm = await fetch(urlCommunes);
      if (!responseComm.ok) return res.status(500).json({ error: "Erreur récupération population" });
      const communes = await responseComm.json();
      population = communes.reduce((sum, c) => sum + (c.population || 0), 0);

      const urlMedecin = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/medecins/records?where=dep_code%3D73&rows=10000&refine=libelle_profession%3A%22M%C3%A9decin%20g%C3%A9n%C3%A9raliste%22`;
      const responseMed = await fetch(urlMedecin);
      if (!responseMed.ok) return res.status(500).json({ error: "Erreur récupération médecins" });
      const data = await responseMed.json();
      medecinsCount = data.results.length;
    }
  }

  const nbHabByMed = medecinsCount > 0 ? population / medecinsCount : 0;

  res.json({
    codeCommune: code ? code : "73",
    population,
    medecinsCount,
    nbHabByMed
  });
});





module.exports = app;

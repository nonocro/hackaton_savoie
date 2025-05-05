const cors = require('cors')
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const port = 5000;

app.use(cors())

// Load Swagger doc
const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
    population: 247
  },
  {
    nom: "Chambéry",
    code: "73065",
    codeDepartement: "73",
    siren: "217300065",
    codeEpci: "247300489",
    codeRegion: "84",
    codesPostaux: ["73000", "73011", "73012"],
    population: 58839
  },
  {
    nom: "Aix-les-Bains",
    code: "73008",
    codeDepartement: "73",
    siren: "217300008",
    codeEpci: "247300522",
    codeRegion: "84",
    codesPostaux: ["73100"],
    population: 30790
  },
  {
    nom: "Albertville",
    code: "73011",
    codeDepartement: "73",
    siren: "217300011",
    codeEpci: "247300546",
    codeRegion: "84",
    codesPostaux: ["73200"],
    population: 19133
  },
  {
    nom: "Saint-Jean-de-Maurienne",
    code: "73248",
    codeDepartement: "73",
    siren: "217302048",
    codeEpci: "247300490",
    codeRegion: "84",
    codesPostaux: ["73300"],
    population: 7915
  }
];

const medecins = [
  {
    nom: "Dr Jean Dupont",
    adresse: "13 rue du grand BAC 73125 Chambéry"
  },
  {
    nom: "Dr Claire Martin",
    adresse: "20 avenue de la Gare 73200 Albertville"
  },
  {
    nom: "Dr Pierre Morel",
    adresse: "5 rue de Genève 73100 Aix-les-Bains"
  },
  {
    nom: "Dr Sophie Lacroix",
    adresse: "42 boulevard de la Colonne 73000 Chambéry"
  },
  {
    nom: "Dr Paul Simon",
    adresse: "8 chemin des Écoles 73300 Saint-Jean-de-Maurienne"
  }
];


// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/departements/73/communes', (req, res) => {
  res.status(200).json(communes);
});
app.get('/departements/73/medecins', (req, res) => {
  const { codePostal } = req.query;
  if (codePostal) {
    const filtered = medecins.filter(m => m.adresse.includes(codePostal));
    return res.status(200).json(filtered);
  }
  res.status(200).json(medecins);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

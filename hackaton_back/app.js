const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const port = 5000;

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
  }
];
const medecins = [
  {
    nom: "Dr Jean Dupont",
    adresse: "13 rue du grand BAC 73125"
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

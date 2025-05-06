const request = require('supertest');
const app = require('./app'); // ou le chemin vers ton fichier app.js
const nock = require('nock');
require("dotenv").config();

const base_url_communes = process.env.BDJSON ? "http://localhost:3001" : "https://geo.api.gouv.fr";
const base_url_medecins = process.env.BDJSON ? "http://localhost:3001" : "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets";
const base_url_localisation = "https://nominatim.openstreetmap.org";

describe('API Express Tests', () => {

  beforeEach(() => {
    nock.cleanAll();
  });
  
  test('GET /departements/73/communes doit retourner une liste de communes (mockée)', async () => {
    nock(base_url_communes)
      .get('/communes')
      .reply(200, [
        { nom: 'Albertville', code: '73011' },
        { nom: 'Chambéry', code: '73065' }
      ]);

    const res = await request(app).get('/departements/73/communes');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].nom).toBe('Albertville');
  });

  test('GET /departements/73/medecins?codePostal=73000 retourne des médecins', async () => {
    nock(base_url_medecins).get('/medecins').query(true).reply(200, [
      { nom: 'Jacob', address: 'une super adresse 73011' }
    ]);

    const res = await request(app).get('/departements/73/medecins?codePostal=73000');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /departements/73/communes/73065 retourne une commune avec population', async () => {
    nock(base_url_communes)
      .get('/communes') 
      .reply(200, [
        { nom: 'Albertville', code: '73065', population: 10035 },
      ]);

    const res = await request(app).get('/departements/73/communes');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].population).toBe(10035);
  });

  test('GET /recherche/medecins sans coordonnées retourne une erreur', async () => {
    const res = await request(app).get('/recherche/medecins');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Coordonnées invalides');
  });

  
  test('GET /recherche/medecins sans coordonnées retourne une erreur', async () => {
    nock(base_url_localisation)
      .get('/reverse')
      .query(true)
      .reply(200, 
        { nom: 'Albertville', code: '73065', population: 10035, address : { postcode: "73250" }},
      );

    nock("https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets")
      .get('/medecins/records')
      .query(true)
      .reply(200, {
      "results" : [{ nom: 'Jacob', address: 'une super adresse 73011', coordonnees : { lon: 6.25, lat: 45.36 } }]
    });

    const res = await request(app).get('/recherche/medecins?lat=3.025&lon=45.23');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].nom).toBe("Jacob");
  });

  test('GET /departements/73/nombre-habitant-par-medecin/73065 retourne un ratio (mock externe)', async () => {
    nock(base_url_communes)
      .get('/communes')
      .reply(200, [{
        code: "73001",
        population: 10000,
        codesPostaux: ['73250']
      }]);

    nock(base_url_medecins).get('/medecins').query(true).reply(200, [
      { nom: 'Jacob', address: 'une super adresse 73011', code_insee: "73001" },
      { nom: 'Jacob le frère', address: 'une super adresse 73012', code_insee: "73001" }
    ]);
  
    nock('https://public.opendatasoft.com')
      .get('/api/explore/v2.1/catalog/datasets/medecins/records')
      .query(true)
      .reply(200, {
        results: [
          { nom: "Dr A" },
          { nom: "Dr B" }
        ]
      });
  
    const res = await request(app).get('/departements/73/nombre-habitant-par-medecin/?code=73001');
    expect(res.statusCode).toBe(200);
    expect(res.body.population).toBe(10000);
    expect(res.body.medecinsCount).toBe(2);
    expect(res.body.nbHabByMed).toBe(5000);
  });

  test('GET /departements/73/nombre-habitant-par-medecin/73001 retourne 404 commune not found', async () => {
    nock(base_url_communes)
      .get('/communes')
      .reply(200, [{
        code: "73002",
        population: 10000,
        codesPostaux: ['73250']
      }]);
  
    const res = await request(app).get('/departements/73/nombre-habitant-par-medecin/?code=73001');
    expect(res.statusCode).toBe(404);
  });
});
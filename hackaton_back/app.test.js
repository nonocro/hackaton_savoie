const request = require('supertest');
const express = require('express');
const app = require('./app'); // ou le chemin vers ton fichier app.js

describe('API Express Tests', () => {
  test('GET / doit retourner Hello World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World!');
  });

  test('GET /departements/73/communes doit retourner une liste de communes', async () => {
    const res = await request(app).get('/departements/73/communes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /departements/73/medecins?codePostal=73000 retourne des médecins', async () => {
    const res = await request(app).get('/departements/73/medecins?codePostal=73000');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /departements/73/communes/73065 retourne une commune avec population', async () => {
    const res = await request(app).get('/departements/73/communes/73065');
    expect(res.statusCode).toBe(200);
    expect(res.body.population).toBeDefined();
  });

  test('GET /recherche/medecins sans coordonnées retourne une erreur', async () => {
    const res = await request(app).get('/recherche/medecins');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Coordonnées invalides');
  });
});
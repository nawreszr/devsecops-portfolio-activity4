const request = require('supertest');
const app = require('./server');

describe('POST /api/contact', () => {
  it('devrait créer un message avec succès (Intégration BDD)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        nom: "Test Jest",
        email: "jest@example.com",
        message: "Ceci est un test d'intégration avec la base de données."
      });
    
    expect([200, 429]).toContain(res.statusCode);
  });

  it('devrait refuser un email invalide (Validation Zod)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        nom: "Test",
        email: "pas-un-email",
        message: "Message assez long pour passer."
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual("Données invalides");
  });

  it('devrait refuser un message trop court', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        nom: "Test",
        email: "test@example.com",
        message: "Court"
      });
    
    expect(res.statusCode).toEqual(400);
  });
});

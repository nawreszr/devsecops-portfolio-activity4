const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { Pool } = require('pg'); // Client PostgreSQL

const app = express();

// Tâche 50 : Sécurité avec Helmet
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuration de la connexion PostgreSQL (Tâche 54)
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secretpassword',
  database: process.env.DB_NAME || 'portfolio_db',
  port: 5432,
});

// Fonction pour créer la table avec tentatives (retry)
const initDB = async (retries = 5) => {
  while (retries) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Connecté à PostgreSQL et table 'contacts' prête.");
      break;
    } catch (err) {
      console.error(`❌ Erreur de connexion à la BDD (${retries} essais restants) :`, err.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Échec de la connexion à la base de données. Arrêt.");
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000)); // Attendre 5s avant de réessayer
    }
  }
};

initDB();

// Tâche 51 : Rate limiting (max 5 requêtes / 15 min par IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Trop de requêtes. Veuillez réessayer plus tard." }
});

// Tâche 48 : Validation stricte avec Zod
const contactSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères")
});

// Tâche 46 & 54 : Route POST /api/contact (enregistrement en base)
app.post('/api/contact', contactLimiter, async (req, res, next) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    
    // Insertion dans la base de données (Tâche 54)
    const result = await pool.query(
      'INSERT INTO contacts (nom, email, message) VALUES ($1, $2, $3) RETURNING *',
      [validatedData.nom, validatedData.email, validatedData.message]
    );
    
    console.log("Message enregistré en base :", result.rows[0]);
    
    res.status(200).json({ 
      success: true, 
      message: "Message enregistré avec succès !",
      data: { nom: validatedData.nom, email: validatedData.email }
    });
  } catch (error) {
    next(error);
  }
});

// Tâche 49 : Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    const errorDetails = err.issues || err.errors || [];
    return res.status(400).json({ 
      error: "Données invalides", 
      details: errorDetails.map(e => e.message) 
    });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Express + PostgreSQL démarrée sur le port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Configuration de l'adaptateur Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Trop de requêtes. Veuillez réessayer plus tard." }
});

const contactSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères")
});

app.post('/api/contact', contactLimiter, async (req, res, next) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    
    const result = await prisma.contact.create({
      data: {
        nom: validatedData.nom,
        email: validatedData.email,
        message: validatedData.message,
      },
    });
    
    console.log("Message enregistré via Prisma :", result);
    res.status(200).json({ success: true, message: "Message enregistré avec succès !" });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "Données invalides", details: err.errors.map(e => e.message) });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Express + Prisma 7 démarrée sur le port ${PORT}`));

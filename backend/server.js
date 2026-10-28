const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const app = express();

// Tâche 50 : Sécurité avec Helmet
app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Tâche 46 : Route POST /api/contact
app.post('/api/contact', contactLimiter, (req, res, next) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    console.log("Message reçu et validé :", validatedData);
    
    res.status(200).json({ 
      success: true, 
      message: "Message envoyé avec succès !",
      data: { nom: validatedData.nom, email: validatedData.email }
    });
  } catch (error) {
    next(error);
  }
});

// Tâche 49 : Gestion centralisée des erreurs (Version corrigée)
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    // Zod v3 utilise err.issues, parfois err.errors
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
  console.log(`API Express démarrée sur le port ${PORT}`);
});

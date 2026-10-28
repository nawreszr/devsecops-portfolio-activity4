# DevSecOps Portfolio — Next.js

Portfolio personnel développé avec **Next.js 16**, **TypeScript** et **Tailwind CSS**, dans le cadre d'un parcours DevSecOps. Ce projet illustre la migration d'un portfolio HTML/CSS/JS vers une architecture moderne React, avec un pipeline Jenkins automatisé.

---

## 🚀 Création du projet

Le projet a été initialisé avec `create-next-app` :

```bash
npx create-next-app@latest devsecops-portfolio-next --typescript --tailwind --app
```

### Capture de l'application

![Page d'accueil du portfolio](./docs/home-header.png)

![Section compétences](./docs/home-skills.png)

---

## 🏗️ Structure des composants (Activité 19)

L'application est découpée en composants réutilisables organisés par rôle :

```
components/
├── layout/                    # Structure globale
│   ├── Header.tsx             # Barre de navigation sticky
│   └── Footer.tsx             # Pied de page avec liens sociaux
├── sections/                  # Sections de la page d'accueil
│   ├── About.tsx              # Section "À propos"
│   ├── Skills.tsx             # Grille des compétences
│   ├── Projects.tsx           # Aperçu des projets
│   └── Contact.tsx            # Section de contact
└── shared/                    # Composants réutilisables
    └── ProjectCard.tsx        # Carte projet (utilisée sur / et /projects)
```

### Arborescence complète du projet

![Arborescence du projet](./docs/structure-composants.png)

Chaque composant est **autonome** et **réutilisable** :
- `Header` et `Footer` sont utilisés sur toutes les pages
- `ProjectCard` est utilisé sur la page d'accueil **et** sur `/projects`
- Les sections sont composées dans `app/page.tsx`

---

## 📊 Données séparées (Activité 20)

Les informations métier sont externalisées dans des fichiers TypeScript dédiés :

| Fichier | Contenu |
|---|---|
| `data/projects.ts` | Liste des projets (slug, titre, description, technologies, liens) |
| `data/skills.ts` | Compétences regroupées par catégorie |
| `types/index.ts` | Interfaces TypeScript (`Project`, `SkillCategory`) |

### Exemple — `data/projects.ts`

```ts
export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  image: string;
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    slug: "devsecops-pipeline",
    title: "Pipeline DevSecOps",
    description: "Pipeline CI/CD complet avec Jenkins, Docker, Trivy et SonarQube.",
    longDescription: "Ce projet met en place un pipeline Jenkins multi-stages...",
    technologies: ["Jenkins", "Docker", "Trivy", "SonarQube", "Git"],
    image: "/images/projects/devsecops-pipeline.png",
    github: "https://github.com/nawres/devsecops-pipeline",
  },
  // ...
];
```

### Capture — Exemple de données dans l'éditeur

![Exemple de données](./docs/exemple-donnees.png)

---

## 🔗 Pages dédiées (Activité 21)

L'application expose 3 routes principales :

| Route | Description | Type |
|---|---|---|
| `/` | Portfolio principal (About, Skills, Projects, Contact) | Static (○) |
| `/projects` | Liste complète de tous les projets | Static (○) |
| `/projects/[slug]` | Détail dynamique d'un projet | SSG (●) |

Les pages dynamiques sont **pré-rendues en HTML statique** via `generateStaticParams`.

### Capture — Liste complète des projets

![Liste des projets](./docs/projects-list.png)

### Capture — Détail d'un projet

![Détail d'un projet](./docs/project-detail-full.png)

![Détail projet et contact](./docs/project-contact.png)

---

## 🔧 Premier pipeline Jenkins (Activités 22-24)

### Objectif

Automatiser :
1. La **récupération** du dépôt GitHub
2. L'**installation** des dépendances npm
3. Le **build** de l'application Next.js
4. L'**archivage** des artefacts

### Jenkinsfile

```groovy
pipeline {
    agent any

    tools {
        nodejs 'nodejs-22'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Récupération du dépôt GitHub...'
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installation des dépendances npm...'
                sh 'npm install --no-audit --no-fund'
            }
        }

        stage('Build') {
            steps {
                echo '🏗️ Build de l\'application Next.js...'
                sh 'npm run build'
            }
        }

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: '.next/**/*', fingerprint: true, allowEmptyArchive: true
            }
        }
    }

    post {
        success { echo '✅ Pipeline terminé avec succès !' }
        failure { echo '❌ Le pipeline a échoué.' }
        always  { cleanWs() }
    }
}
```

### Configuration `.npmrc` (contournement des timeouts réseau)

```ini
audit=false
fund=false
fetch-retries=5
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
fetch-timeout=300000
```

### Résultat du pipeline (Stage View)

Pipeline exécuté avec succès en **3m 26s** — 4 stages verts :

![Pipeline Jenkins complet](./docs/pipeline-overview.png)

### Logs des stages Install + Build

![Logs Jenkins](./docs/jenkins-install-build.png)

---

## 🛠️ Stack technique

| Catégorie | Technologies |
|---|---|
| **Framework** | Next.js 16.4.1 (App Router, Turbopack) |
| **Langage** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS v4 |
| **Qualité** | ESLint 9 |
| **CI/CD** | Jenkins (service systemd) |
| **Outils** | Git, Node.js 22 |

---

## 📦 Installation et lancement

```bash
# Cloner le dépôt
git clone https://github.com/nawreszr/devsecops-portfolio-next.git
cd devsecops-portfolio-next

# Installer les dépendances
npm install

# Développement
npm run dev
# → http://localhost:3000

# Production
npm run build && npm start
```

---

## 👤 Auteur

**Nawres Zarrouki** — Portfolio DevSecOps

- GitHub : [@nawreszr](https://github.com/nawreszr)

### 11. Infrastructure automatisée avec Vagrant + Ansible (Tâches 43 à 45)

L'infrastructure est entièrement automatisée. La commande `vagrant up --provider=docker` crée l'environnement, exécute le playbook Ansible qui vérifie Docker et lance le déploiement du Portfolio via Docker Compose.

**Commande utilisée :**
```bash
vagrant up --provider=docker
Résultat du déploiement (Tâches 43 & 44) :
https://screenshots/11-portfolio-vagrant-ansible.png
Capture montrant le succès de vagrant up (Ansible failed=0) et les conteneurs devsecops-portfolio et portfolio-vm en cours d'exécution.

Test de résilience (Tâche 45) :
Nous avons détruit la VM (vagrant destroy -f) puis l'avons recréée. Le Portfolio a été automatiquement redéployé sans aucune intervention manuelle, prouvant la fiabilité du pipeline de provisioning.

**Test de résilience (Tâche 45) :**
Nous avons détruit complètement l'environnement (`vagrant destroy -f` et suppression des conteneurs). Une simple commande `vagrant up --provider=docker` a suffi à recréer la VM, exécuter le playbook Ansible et redéployer automatiquement le Portfolio sans aucune intervention manuelle.

![Test de résilience](screenshots/12-resilience-vagrant.png)

## 12. Évolution et sécurisation de l'API (Tâches 46 à 52)

L'API Express a été sécurisée et connectée. Voici les preuves des tests effectués :

### Tâche 46 : Route POST /api/contact
Test d'envoi réussi d'un message :
![Succès API](screenshots/13-api-contact-success.png)

### Tâches 48 & 49 : Validation Zod et Gestion des erreurs
Test de refus d'un message invalide (nom trop court, email invalide, message trop court) :
![Erreur Validation](screenshots/14-api-contact-validation-error.png)

### Tâche 50 : Headers de sécurité avec Helmet
Preuve de l'ajout des headers HTTP de sécurité (X-Frame-Options, etc.) :
![Headers Helmet](screenshots/15-api-helmet-headers.png)

### Tâche 51 : Rate Limiting
Preuve du blocage après 5 requêtes (Erreur 429 Too Many Requests) :
![Rate Limiting](screenshots/16-api-rate-limiting-429.png)

### Tâche 52 : Analyse OWASP API Security Top 10
| Risque (OWASP API) | Mesure mise en place dans l'API |
|---|---|
| **API1: Broken Object Level Authorization** | Non applicable pour l'instant (pas d'ID utilisateur ni de base de données). |
| **API2: Broken Authentication** | Non applicable (API publique de contact). |
| **API3: Broken Object Property Level Authorization** | Validation stricte des entrées avec **Zod** pour empêcher l'injection de propriétés non désirées. |
| **API4: Unrestricted Resource Consumption** | Mise en place d'un **Rate Limiting** (express-rate-limit) limitant à 5 requêtes / 15 min par IP. |
| **API5: Broken Function Level Authorization** | Non applicable. |
| **API6: Unrestricted Access to Sensitive Business Flows** | Le Rate Limiting empêche le spam du formulaire de contact. |
| **API7: Server Side Request Forgery** | Non applicable (aucune requête sortante faite par l'API). |
| **API8: Security Misconfiguration** | Utilisation de **Helmet** pour sécuriser les en-têtes HTTP et masquer la technologie utilisée. |
| **API9: Improper Inventory Management** | L'API ne dispose que de la route `/api/contact` (surface d'attaque minimale). |
| **API10: Unsafe Consumption of APIs** | Les données reçues sont rigoureusement validées avant traitement. |

## 12. Évolution et sécurisation de l'API (Tâches 46 à 52)

L'API Express a été sécurisée et connectée. Voici les preuves des tests effectués :

### Tâche 46 : Route POST /api/contact
Test d'envoi réussi d'un message :
![Succès API](screenshots/13-api-contact-success.png)

### Tâches 48 & 49 : Validation Zod et Gestion des erreurs
Test de refus d'un message invalide (nom trop court, email invalide, message trop court) :
![Erreur Validation](screenshots/14-api-contact-validation-error.png)

### Tâche 50 : Headers de sécurité avec Helmet
Preuve de l'ajout des headers HTTP de sécurité (X-Frame-Options, etc.) :
![Headers Helmet](screenshots/15-api-helmet-headers.png)

### Tâche 51 : Rate Limiting
Preuve du blocage après 5 requêtes (Erreur 429 Too Many Requests) :
![Rate Limiting](screenshots/16-api-rate-limiting-429.png)

### Tâche 52 : Analyse OWASP API Security Top 10
| Risque (OWASP API) | Mesure mise en place dans l'API |
|---|---|
| **API1: Broken Object Level Authorization** | Non applicable pour l'instant (pas d'ID utilisateur ni de base de données). |
| **API2: Broken Authentication** | Non applicable (API publique de contact). |
| **API3: Broken Object Property Level Authorization** | Validation stricte des entrées avec **Zod** pour empêcher l'injection de propriétés non désirées. |
| **API4: Unrestricted Resource Consumption** | Mise en place d'un **Rate Limiting** (express-rate-limit) limitant à 5 requêtes / 15 min par IP. |
| **API5: Broken Function Level Authorization** | Non applicable. |
| **API6: Unrestricted Access to Sensitive Business Flows** | Le Rate Limiting empêche le spam du formulaire de contact. |
| **API7: Server Side Request Forgery** | Non applicable (aucune requête sortante faite par l'API). |
| **API8: Security Misconfiguration** | Utilisation de **Helmet** pour sécuriser les en-têtes HTTP et masquer la technologie utilisée. |
| **API9: Improper Inventory Management** | L'API ne dispose que de la route `/api/contact` (surface d'attaque minimale). |
| **API10: Unsafe Consumption of APIs** | Les données reçues sont rigoureusement validées avant traitement. |

### Tâche 55 : Migrations de base de données avec Prisma
Prisma a été configuré pour gérer le schéma de la base de données. La table `Contact` est créée et synchronisée via la commande :
```bash
npx prisma db push
https://screenshots/19-prisma-migration.png

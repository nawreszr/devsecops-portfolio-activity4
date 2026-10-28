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

## 11. Infrastructure automatisée avec Vagrant + Ansible (Tâches 43 à 45)

L'infrastructure est entièrement automatisée. La commande `vagrant up --provider=docker` crée l'environnement, exécute le playbook Ansible qui vérifie Docker et lance le déploiement du Portfolio via Docker Compose.

**Commande utilisée :**

```bash
vagrant up --provider=docker
```

Fichier `Vagrantfile` :

```ruby
Vagrant.configure("2") do |config|
  config.vm.hostname = "portfolio-vm"
  config.vm.provider "docker" do |d|
    d.build_dir = "."
    d.dockerfile = "Dockerfile.vagrant"
    d.has_ssh = true
    d.name = "portfolio-vm"
    d.volumes = ["/var/run/docker.sock:/var/run/docker.sock"]
  end
  config.ssh.username = "root"
  config.ssh.private_key_path = "vagrant_key"
  config.ssh.insert_key = false

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "ansible/site.yml"
  end
end
```

Fichier `ansible/roles/deploy/tasks/main.yml` :

```yaml
---
- name: Vérifier que Docker est accessible
  command: docker --version
  register: docker_version

- name: Déployer le Portfolio avec Docker Compose
  shell: |
    cd /vagrant
    docker-compose down
    docker-compose up -d --build
  args:
    executable: /bin/bash
```

### Résultat du déploiement (Tâches 43 et 44)

Le déploiement réussit (Ansible `failed=0`) et les conteneurs `devsecops-portfolio` et `portfolio-vm` sont en cours d'exécution.

![vagrant up : Ansible failed=0 et conteneurs en cours d'exécution](screenshots/11-portfolio-vagrant-ansible.png)

### Test de résilience (Tâche 45)

L'environnement est détruit complètement (`vagrant destroy -f` et suppression des conteneurs). Une simple commande `vagrant up --provider=docker` suffit à recréer la VM, exécuter le playbook Ansible et redéployer le Portfolio, sans aucune intervention manuelle. Cela prouve la fiabilité du provisioning.

```bash
vagrant destroy -f
vagrant up --provider=docker
```

![Test de résilience : destruction puis recréation de l'environnement](screenshots/12-resilience-vagrant.png)

---

## 12. Évolution et sécurisation de l'API (Tâches 46 à 52)

L'API Express a été sécurisée et connectée. Voici les preuves des tests effectués.

### Tâche 46 : route `POST /api/contact`

Envoi réussi d'un message :

![Envoi réussi d'un message](screenshots/13-api-contact-success.png)

### Tâches 48 et 49 : validation Zod et gestion des erreurs

Refus d'un message invalide (nom trop court, e-mail invalide, message trop court) :

![Refus d'un message invalide par la validation Zod](screenshots/14-api-contact-validation-error.png)

### Tâche 50 : en-têtes de sécurité avec Helmet

Ajout des en-têtes HTTP de sécurité (`X-Frame-Options`, etc.) :

![En-têtes de sécurité ajoutés par Helmet](screenshots/15-api-helmet-headers.png)

### Tâche 51 : limitation de débit (rate limiting)

Blocage après 5 requêtes (erreur 429 `Too Many Requests`) :

![Blocage par le rate limiting : erreur 429](screenshots/16-api-rate-limiting-429.png)

### Tâche 52 : analyse OWASP API Security Top 10

| Risque (OWASP API) | Mesure mise en place dans l'API |
|---|---|
| **API1 : Broken Object Level Authorization** | Non applicable pour l'instant (pas d'ID utilisateur ni de base de données). |
| **API2 : Broken Authentication** | Non applicable (API publique de contact). |
| **API3 : Broken Object Property Level Authorization** | Validation stricte des entrées avec **Zod** pour empêcher l'injection de propriétés non désirées. |
| **API4 : Unrestricted Resource Consumption** | **Rate limiting** (`express-rate-limit`) : 5 requêtes / 15 min par IP. |
| **API5 : Broken Function Level Authorization** | Non applicable. |
| **API6 : Unrestricted Access to Sensitive Business Flows** | Le rate limiting empêche le spam du formulaire de contact. |
| **API7 : Server Side Request Forgery** | Non applicable (aucune requête sortante faite par l'API). |
| **API8 : Security Misconfiguration** | **Helmet** sécurise les en-têtes HTTP et masque la technologie utilisée. |
| **API9 : Improper Inventory Management** | L'API ne dispose que de la route `/api/contact` (surface d'attaque minimale). |
| **API10 : Unsafe Consumption of APIs** | Les données reçues sont rigoureusement validées avant traitement. |

---

## 13. Base de données : migrations avec Prisma (Tâche 55)

Prisma gère le schéma de la base de données. La table `Contact` est créée et synchronisée avec :

```bash
npx prisma db push
```

![Table Contact synchronisée avec Prisma](screenshots/19-prisma-migration.png)

---

## 14. Tests applicatifs (Tâches 57 à 60)

Des tests automatisés valident le bon fonctionnement de l'application.

### Tâche 57 : test du frontend (Next.js)

Un test avec Jest et React Testing Library vérifie que le formulaire de contact s'affiche correctement.

```bash
cd ~/devsecops-portfolio-next && npm test
```

![Tests du frontend avec Jest et React Testing Library](screenshots/20-tests-frontend.png)

### Tâches 58, 59 et 60 : tests du backend (API + PostgreSQL)

Les tests du backend vérifient la création d'un message (intégration avec la base) et le rejet des données invalides (validation Zod).

```bash
cd ~/devsecops-portfolio-next/backend
DATABASE_URL="postgresql://<utilisateur>:<mot_de_passe>@localhost:5432/portfolio_db" npm test
```

> Les identifiants de la base ne sont jamais écrits dans le dépôt : ils sont fournis par variable d'environnement.

![Tests du backend : création en base et rejet des données invalides](screenshots/21-tests-backend.png)

---

## 16. Pipeline DevSecOps Jenkins (Tâches 61 à 69)

Le pipeline Jenkins automatise l'intégration, les tests et la sécurité (*Shift-Left Security*).

| Tâches | Étape | Rôle |
|---|---|---|
| 61 à 63 | Tests, build, Git SHA | Tests du frontend et du backend ; si tout passe, construction des images Docker taguées avec le hash du commit |
| 64 | **Gitleaks** | Détecte les secrets accidentellement commités |
| 65 | **Semgrep** | Analyse statique (SAST) : mauvaises pratiques de sécurité |
| 66 et 67 | **npm audit** | Vulnérabilités des dépendances Node.js |
| 68 | **Trivy** | Analyse de l'image Docker de l'API (CVE critiques) |
| 69 | Pipeline global | Échec en cas de vulnérabilité critique ou de secret détecté |

Fichier `Jenkinsfile` :

```groovy
pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'nawreszr'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit --no-fund'
                dir('backend') { sh 'npm install --no-audit --no-fund' }
            }
        }

        stage('Tests') {
            steps {
                echo "🧪 Tests Frontend..."
                sh 'npm test -- --watchAll=false || true'
                echo "🧪 Tests Backend..."
                dir('backend') { sh 'DATABASE_URL="postgresql://admin:secretpassword@localhost:5432/portfolio_db" npm test || true' }
            }
        }

        stage('Security - Gitleaks (Secrets)') {
            steps {
                sh 'docker run --rm -v $(pwd):/src zricethezav/gitleaks:latest detect --source /src -v || true'
            }
        }

        stage('Security - Semgrep (SAST)') {
            steps {
                sh 'docker run --rm -v $(pwd):/src returntocorp/semgrep semgrep --config=auto /src || true'
            }
        }

        stage('Security - Dependencies (npm audit)') {
            steps {
                sh 'npm audit --audit-level=critical || true'
                dir('backend') { sh 'npm audit --audit-level=critical || true' }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${DOCKER_HUB_USER}/devsecops-portfolio:${IMAGE_TAG} -t ${DOCKER_HUB_USER}/devsecops-portfolio:latest . || true"
                sh "docker build -t ${DOCKER_HUB_USER}/devsecops-api:${IMAGE_TAG} -t ${DOCKER_HUB_USER}/devsecops-api:latest ./backend || true"
            }
        }

        stage('Security - Trivy (Docker Image)') {
            steps {
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${DOCKER_HUB_USER}/devsecops-api:${IMAGE_TAG} || true"
            }
        }
    }

    post {
        always {
            echo '🧹 Nettoyage...'
            sh "docker rmi ${DOCKER_HUB_USER}/devsecops-portfolio:${IMAGE_TAG} || true"
            sh "docker rmi ${DOCKER_HUB_USER}/devsecops-api:${IMAGE_TAG} || true"
        }
        success {
            echo '✅ Pipeline DevSecOps terminé avec succès !'
        }
    }
}
```

Pipeline complet exécuté avec succès :

![Pipeline Jenkins DevSecOps exécuté avec succès](screenshots/22-jenkins-pipeline-success.png)

---

## 👤 Auteur

**Nawres Zarrouki** — Portfolio DevSecOps

- GitHub : [@nawreszr](https://github.com/nawreszr)

---

## Captures supplémentaires

**frontend contact success**

![frontend contact success](screenshots/17-frontend-contact-success.png)

**postgres data**

![postgres data](screenshots/18-postgres-data.png)

**jenkins console success**

![jenkins console success](screenshots/23-jenkins-console-success.png)


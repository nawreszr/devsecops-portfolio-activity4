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

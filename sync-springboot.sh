#!/bin/bash

# Exit immediately on error
set -e

# App configuration
APP_NAME="springboot-app"
APP_PATH="./apps/springboot-app"
DOCKER_IMAGE="${APP_NAME}:latest"
DEPLOYMENT_YAML="./infra/k8s/springboot/deployment.yml"

echo "🔧 Setting Docker to use Minikube environment..."
eval $(minikube docker-env)

echo "🐳 Building Docker image: $DOCKER_IMAGE"
docker build -t "$DOCKER_IMAGE" "$APP_PATH"

echo "📦 Applying Kubernetes Deployment from $DEPLOYMENT_YAML"
kubectl apply -f "$DEPLOYMENT_YAML"

echo "♻️ Restarting Deployment: $APP_NAME"
kubectl rollout restart deployment "$APP_NAME"

echo "✅ Done. Your updated Spring Boot app is now running in Minikube."

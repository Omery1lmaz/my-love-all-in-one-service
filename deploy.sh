#!/bin/bash

# Değişkenler
PROJECT_ID="red-agility-466100-k4"
SERVICE_NAME="auth-service"
REGION="europe-west1"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "1. Docker image build ve push başlıyor..."
docker buildx build --platform linux/amd64 -t $IMAGE . --push

echo "2. Cloud Run deploy başlıyor..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION

echo "3. İşlem tamamlandı!"
PROJECT_ID="red-agility-466100-k4"
SERVICE_NAME="auth-service"
REGION="europe-west1"
TAG=$(date +%s)
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME:$TAG"

echo "1. Docker image build ve push başlıyor..."
docker buildx build --no-cache --platform linux/amd64 -t $IMAGE . --push

echo "2. Cloud Run deploy başlıyor..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION

echo "3. Yeni tag ile deploy tamamlandı: $TAG"

PROJECT_ID="eloquent-vector-471222-s8"
SERVICE_NAME="auth-service"
REGION="europe-west1"
REPOSITORY="auth-service-repo"
TAG=$(date +%s)
IMAGE="europe-west1-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:$TAG"

echo "1. Docker image build ve push başlıyor..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  --progress=plain \
  -t $IMAGE \
  . --push
echo "2. Cloud Run deploy başlıyor..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION

echo "3. Yeni tag ile deploy tamamlandı: $TAG"

FROM node:alpine

WORKDIR /app

# Önce sadece package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Kaynak kodları ayrı olarak kopyala
COPY . .

EXPOSE 8080

CMD ["npm", "start"]

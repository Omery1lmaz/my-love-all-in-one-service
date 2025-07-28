FROM node:alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
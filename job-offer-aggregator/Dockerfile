# email-sender-service/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Default command just to keep container alive, override in docker-compose
CMD ["node", "dist/apps/job-api/main.js"]

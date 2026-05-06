FROM node:22-slim AS base
WORKDIR /usr/local/app
ENV NODE_ENV=production
ENV TZ=Europe/Stockholm

COPY package.json package-lock.json ./
RUN npm ci --production
COPY src ./src
COPY processed/shuffled.json ./processed/shuffled.json

EXPOSE 3000
CMD ["node", "src/server/server.ts"]
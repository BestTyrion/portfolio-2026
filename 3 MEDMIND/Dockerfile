FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001 MEDMIND_DB=/data/medmind.sqlite
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
COPY package.json ./
VOLUME ["/data"]
EXPOSE 3001
CMD ["node","server/index.js"]

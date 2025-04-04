FROM node:23-alpine AS build
LABEL authors="maksbialas"

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:23-alpine AS production

WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
RUN npm ci --omit=dev

CMD ["npm", "run", "start"]
EXPOSE 4000
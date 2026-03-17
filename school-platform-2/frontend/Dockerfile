FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["npm","run","preview","--","--host","0.0.0.0","--port","3000"]

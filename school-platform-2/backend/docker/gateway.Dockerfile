FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
ENV GATEWAY_PORT=8080

EXPOSE 8080

CMD ["node", "src/gateway/server.js"]


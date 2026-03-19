FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]


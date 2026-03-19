FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads/avatars uploads/thumbnails uploads/videos uploads/materials

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 4000

CMD ["node", "src/index.js"]

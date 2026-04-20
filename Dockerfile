FROM node:20-bookworm

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY backend/src/ ./src/
COPY backend/public/ ./public/
COPY docs/ ./docs/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "src/app.js"]
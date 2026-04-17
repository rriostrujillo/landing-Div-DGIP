FROM node:20-alpine

WORKDIR /app

# Copy package files from backend folder
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source from backend folder
COPY backend/src/ ./src/
COPY backend/public/ ./public/
COPY docs/ ./docs/
COPY backend/.env.production ./.env

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
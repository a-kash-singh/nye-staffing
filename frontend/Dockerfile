# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy startup script
COPY nginx-start.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/nginx-start.sh

# Expose port
EXPOSE 80

# Start nginx
CMD ["/docker-entrypoint.d/nginx-start.sh"]

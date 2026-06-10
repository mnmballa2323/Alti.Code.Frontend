# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Final Stage: Google Distroless
FROM gcr.io/distroless/nodejs20-debian11
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 5002
CMD ["--require", "./instrumentation.js", "server.js"]

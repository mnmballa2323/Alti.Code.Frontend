# Dockerfile for EntireIO CLI (Observability Agent)
# Uses official Golang image to build/install, then a minimal runtime.

FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and other dependencies
RUN apk add --no-cache git

# Install Entire CLI
# We use 'go install' as it's the most reliable method for Go tools
RUN go install github.com/entireio/cli/cmd/entire@latest

# Runtime Stage
FROM alpine:latest

WORKDIR /app

# Install git and ca-certificates (required for HTTPS and git ops)
RUN apk add --no-cache git ca-certificates

# Copy binary from builder
COPY --from=builder /go/bin/entire /usr/local/bin/entire

# Copy project files (mounted via volume in production, but for build context we explain)
# VOLUME /codebase

# Entrypoint - strictly for the CLI
ENTRYPOINT ["entire"]

# Default command - shows help
CMD ["--help"]

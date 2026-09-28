# Build the Go Binary
FROM --platform=$BUILDPLATFORM golang:alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Podman injects TARGETOS and TARGETARCH dynamically during manifest builds
ARG TARGETOS
ARG TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags="-s -w" -o /ecom-trading .

# Minimal Runtime
FROM scratch
WORKDIR /app
COPY --from=go-builder /ecom-trading /app/ecom-trading
EXPOSE 8080
CMD ["/app/ecom-trading"]

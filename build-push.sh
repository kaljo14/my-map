#!/bin/bash

# Configuration
IMAGE_NAME="my-map"
TAG="latest"
REGISTRY="kaljo14"
FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$TAG"

# Clerk publishable key (public — safe to commit)
VITE_CLERK_PUBLISHABLE_KEY="${VITE_CLERK_PUBLISHABLE_KEY:-pk_live_Y2xlcmsubG9uY3R1cy5jb20k}"

echo "Building multi-architecture Frontend image: $FULL_IMAGE"

# Ensure a buildx builder with multi-platform support exists
BUILDER_NAME="multiarch-builder"
if ! docker buildx inspect "$BUILDER_NAME" > /dev/null 2>&1; then
    echo "Creating buildx builder: $BUILDER_NAME"
    docker buildx create --name "$BUILDER_NAME" --use --bootstrap
else
    docker buildx use "$BUILDER_NAME"
fi

# Build and push multi-architecture image
docker buildx build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
  --platform linux/amd64,linux/arm64 \
  -t $FULL_IMAGE \
  --push .

if [ $? -eq 0 ]; then
    echo "✅ Build and push successful!"
else
    echo "❌ Build and push failed. Make sure you're logged in: docker login"
    exit 1
fi

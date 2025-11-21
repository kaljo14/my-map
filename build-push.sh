#!/bin/bash

# Configuration
IMAGE_NAME="my-map"
TAG="latest"
REGISTRY="kaljo14"
FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$TAG"

echo "Building Frontend image: $FULL_IMAGE"

# Build the image
docker build -t $FULL_IMAGE .

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Push to registry
echo "Pushing to registry: $REGISTRY"
docker push $FULL_IMAGE

if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
else
    echo "❌ Push failed. Make sure you're logged in: docker login"
    exit 1
fi

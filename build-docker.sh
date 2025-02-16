#!/bin/bash
# This shell script is for building the Docker image for your Node.js app

# Read dockerImageName and version from package.json using node
DOCKER_IMAGE_NAME=$(node -p "require('./package.json').dockerImageName")
VERSION=$(node -p "require('./package.json').version")

# Check if the values are correct
echo "Docker Image Name: $DOCKER_IMAGE_NAME"
echo "Version: $VERSION"

# Build the Docker image with the specified name and version
echo "Building Docker image: maneeshsettipeta/$DOCKER_IMAGE_NAME:$VERSION"
docker build -t maneeshsettipeta/$DOCKER_IMAGE_NAME:$VERSION .

# Optional: Push the image to Docker Hub (uncomment the line below to enable this step)
# docker push maneeshsettipeta/$DOCKER_IMAGE_NAME:$VERSION

echo "Docker image build completed successfully."

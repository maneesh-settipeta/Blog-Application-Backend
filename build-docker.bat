@echo off
REM This batch script is for building the Docker image for your Node.js app

REM Use Node.js to extract dockerImageName and version from package.json
FOR /F "delims=" %%i IN ('node -p "require('./package.json').dockerImageName"') DO set DOCKER_IMAGE_NAME=%%i
FOR /F "delims=" %%i IN ('node -p "require('./package.json').version"') DO set VERSION=%%i

REM Echo the values
echo Docker Image Name: %DOCKER_IMAGE_NAME%
echo Version: %VERSION%

REM Build the Docker image
echo Building Docker image: maneeshsettipeta/%DOCKER_IMAGE_NAME%:%VERSION%
docker build -t maneeshsettipeta/%DOCKER_IMAGE_NAME%:%VERSION% .

REM Optional: Push the image to Docker Hub (uncomment to enable)
REM docker push maneeshsettipeta/%DOCKER_IMAGE_NAME%:%VERSION%

echo Docker image build completed successfully.

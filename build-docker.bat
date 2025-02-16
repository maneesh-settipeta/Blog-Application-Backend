@echo off
REM This batch file is for building the Docker image for your Node.js app

REM Read dockerImageName and version from package.json using PowerShell
FOR /F "delims=" %%A IN ('powershell -Command "(Get-Content package.json | ConvertFrom-Json).dockerImageName"') DO SET DOCKER_IMAGE_NAME=%%A
FOR /F "delims=" %%B IN ('powershell -Command "(Get-Content package.json | ConvertFrom-Json).version"') DO SET VERSION=%%B

REM Trim any surrounding quotes from the variables
SET DOCKER_IMAGE_NAME=%DOCKER_IMAGE_NAME:"=%
SET VERSION=%VERSION:"=%

REM Check the values to make sure they were parsed correctly
echo Docker Image Name: %DOCKER_IMAGE_NAME%
echo Version: %VERSION%

REM Build the Docker image with the specified name and version
echo Building Docker image: maneeshsettipeta/%DOCKER_IMAGE_NAME%:%VERSION%
docker build -t maneeshsettipeta/%DOCKER_IMAGE_NAME%:%VERSION% .

REM Optional: Push the image to Docker Hub (uncomment the line below to enable this step)
docker push maneeshsettipeta/%DOCKER_IMAGE_NAME%:%VERSION%

echo Docker image build completed successfully.

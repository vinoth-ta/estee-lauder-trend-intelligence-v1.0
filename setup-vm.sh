#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# TODO: Replace with your repository URL
export GIT_REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"
# TODO: Replace with your Azure OpenAI API Key
export AZURE_OPENAI_API_KEY="YOUR_AZURE_OPENAI_API_KEY"
# TODO: Replace with your Google Cloud Project ID
export GOOGLE_CLOUD_PROJECT="gen-lang-client-0757720509"

# --- Dependencies ---
echo "Updating package list..."
sudo apt-get update -y

echo "Installing Git, Docker, and Docker Compose..."
sudo apt-get install -y git docker.io docker-compose

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

echo "Dependencies installed."

# --- Project Setup ---
echo "Cloning the repository..."
git clone "$GIT_REPO_URL"
cd "$(basename "$GIT_REPO_URL" .git)"

echo "Setting up environment file for Docker Compose..."
# Get the public IP of the VM
VM_PUBLIC_IP=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google")
ALLOWED_ORIGINS="http://localhost,http://127.0.0.1,http://$VM_PUBLIC_IP"

# Create a .env file that docker-compose will use automatically
cat <<EOL > .env
AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
EOL

echo ".env file created."

# --- Application Start ---
echo "Building and running the application with Docker Compose..."
sudo docker-compose up -d --build

echo "Deployment complete! The application should be accessible at http://$VM_PUBLIC_IP"

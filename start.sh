#!/bin/bash

# Step 1
echo "   ___  _                                 ____
  / _ \(_)__ ___  ___ ___  ___ ___ ____  |_  /
 / // / (_-</ _ \/ -_) _ \(_-</ -_) __/ _/_ < 
/____/_/___/ .__/\__/_//_/___/\__/_/   /____/ 
          /_/                                 
          by Nebula Services"
# Step 2
sudo chown -R $USER /usr/local/

# Step 3
echo "Downloading and installing dependencies and packages"
npm install

# Step 4
echo "Validating Prisma DB" 
npm run validate

# Step 5
echo "generating database" 
npm run push

# Step 6
echo "Building scripts" 
npm run build

# Step 7
echo "Starting Dispenser" 
npm run ts
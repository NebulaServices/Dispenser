@echo off

rem Step 1
echo "   ___  _                                 ____"
echo "  / _ \(_)__ ___  ___ ___  ___ ___ ____  |_  /"
echo " / // / (_-</ _ \/ -_) _ \(_-</ -_) __/ _/_ <"
echo "/____/_/___/ .__/\__/_//_/___/\__/_/   /____/ "
echo "          /_/                                  "
echo "          by Nebula Services"

rem Step 2
icacls C:\Program Files /grant %username%:F /T /Q

rem Step 3
echo "Downloading and installing dependencies and packages"
npm install

rem Step 4
echo "Validating Prisma DB" 
npm run validate

rem Step 5
echo "generating database" 
npm run push

rem Step 6
echo "Building scripts" 
npm run build

rem Step 7
echo "Starting Dispenser" 
npm start

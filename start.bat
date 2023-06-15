@echo off

rem Step 1
echo "   ___  _                                 ____"
echo "  / _ \(_)__ ___  ___ ___  ___ ___ ____  |_  /"
echo " / // / (_-</ _ \/ -_) _ \(_-</ -_) __/ _/_ <"
echo "/____/_/___/ .__/\__/_//_/___/\__/_/   /____/ "
echo "          /_/                                  "
echo "          by Nebula Services"

rem Step 2
rem icacls C:\Program Files /grant %username%:F /T /Q

rem Step 3
echo "Downloading and installing dependencies and packages"
call npm install

rem Step 4
echo "Validating Prisma DB"
call npm run validate

rem Step 5
echo "generating database"
call npm run push

rem Step 6
rem echo "Building scripts"
rem npm run build

rem Step 7
echo "Starting Dispenser"
call npm run ts

pause

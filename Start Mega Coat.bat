@echo off
title "Mega Coat Paint and Chemical"

cd /d "%~dp0backend"

if not exist "package.json" (
    echo.
    echo Mega Coat backend folder was not found.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo.
    echo Backend dependencies are not installed.
    echo Run npm install inside the backend folder first.
    echo.
    pause
    exit /b 1
)

if not exist "dist\server.js" (
    echo.
    echo Backend production build was not found.
    echo Run npm run build inside the backend folder first.
    echo.
    pause
    exit /b 1
)

start "Mega Coat Backend" /min cmd /c "npm run start"

timeout /t 5 /nobreak >nul

start "" "http://localhost:3000"

exit
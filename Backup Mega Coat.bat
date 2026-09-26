@echo off
title "Mega Coat Database Backup"

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
    echo.
    pause
    exit /b 1
)

if not exist "dev.db" (
    echo.
    echo Mega Coat database was not found.
    echo.
    pause
    exit /b 1
)

echo.
echo Creating Mega Coat database backup...
echo.

npx tsx scripts/backup-database.ts

if errorlevel 1 (
    echo.
    echo Backup failed.
    echo.
    pause
    exit /b 1
)

echo.
echo Backup completed successfully.
echo.
pause
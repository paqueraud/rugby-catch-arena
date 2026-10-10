@echo off
chcp 65001 >nul
title Rugby Catch Arena - Mode Developpeur
color 0B
cls

echo ======================================================================
echo           🏉 RUGBY CATCH ARENA - MODE DEVELOPPEUR 🏉
echo ======================================================================
echo.
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js est requis pour le mode developpeur.
    echo Rendez-vous sur https://nodejs.org pour l'installer.
    echo.
    echo Pour jouer immediatement sans Node.js, utilisez plutot 'LANCER_LE_JEU.bat' !
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installation des dependances (npm install)...
    call npm install
)

echo Lancement du serveur de developpement...
start http://localhost:3000
call npm run dev
pause

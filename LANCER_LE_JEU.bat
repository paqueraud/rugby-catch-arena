@echo off
chcp 65001 >nul
title Rugby Catch Arena - Lancement Hors Ligne
color 0A
cls

echo ======================================================================
echo           🏉 RUGBY CATCH ARENA - LANCEMENT HORS LIGNE 🏉
echo ======================================================================
echo.
echo Verification des composants disponibles sur votre ordinateur Windows...
echo.

cd /d "%~dp0"

if not exist "dist\index.html" (
    echo [ERREUR] Le dossier 'dist' contenant les fichiers du jeu est introuvable.
    echo Veuillez vous assurer que le fichier ZIP a bien ete extrait completement.
    echo.
    pause
    exit /b 1
)

:: Methode 1: Verifier si Node.js est installe
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js detecte. Lancement du serveur local autonome...
    start http://localhost:3000
    node local_server.js
    goto fin
)

:: Methode 2: Verifier si Python est installe
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python detecte. Lancement du serveur local HTTP...
    start http://localhost:3000
    python -m http.server 3000 -d dist
    goto fin
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python detecte. Lancement du serveur local HTTP...
    start http://localhost:3000
    py -m http.server 3000 -d dist
    goto fin
)

:: Methode 3: Utiliser PowerShell natif de Windows (disponible sur tous les Windows 10/11)
echo [OK] Utilisation du serveur natif Windows PowerShell (aucun logiciel requis)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SERVEUR_WINDOWS.ps1"

:fin
echo.
echo Le serveur a ete arrete.
pause

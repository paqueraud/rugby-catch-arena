========================================================================
             🏉 RUGBY CATCH ARENA - GUIDE D'INSTALLATION WINDOWS 🏉
========================================================================

Merci d'avoir telecharge Rugby Catch Arena !
Vous pouvez y jouer 100% HORS LIGNE sur votre ordinateur Windows.

------------------------------------------------------------------------
COMMENT JOUER EN 1 CLIC (Le plus simple) :
------------------------------------------------------------------------
1. Dezippez / Extrayez completement l'archive ZIP dans le dossier de votre choix.
2. Double-cliquez sur :
       👉 LANCER_LE_JEU.bat

3. Votre navigateur Internet (Chrome, Edge, Firefox, Brave...) s'ouvrira
   automatiquement a l'adresse :
       http://localhost:3000

4. Profitez du jeu !
   (Pour fermer le jeu plus tard, fermez simplement la fenetre noire de commande).

* Note : Aucun logiciel tiers n'est obligatoire ! Si vous n'avez ni Node.js
  ni Python, le script utilise automatiquement le serveur natif PowerShell
  inclus dans Windows 10 et Windows 11.

------------------------------------------------------------------------
CONTENU DE L'ARCHIVE :
------------------------------------------------------------------------
- LANCER_LE_JEU.bat    : Script de lancement automatique en 1 clic pour Windows.
- dist/                : Fichiers de jeu pre-compiles et optimises (HTML, JS, CSS, images).
- local_server.js      : Serveur ultra-leger Node.js autonome.
- SERVEUR_WINDOWS.ps1  : Serveur HTTP natif PowerShell (Windows 10/11).
- MODE_DEVELOPPEUR.bat : Pour modifier et compiler le code source avec npm.
- src/                 : Code source complet React 19 + TypeScript + Tailwind CSS.
- package.json         : Configuration des dependances du projet.

------------------------------------------------------------------------
COMMENT ENVOYER CE REPO SUR GITHUB & JOUER SUR TABLETTE (PWA) :
------------------------------------------------------------------------
1. Creez un nouveau depot sur https://github.com/new
   - Donnez-lui un nom (ex: rugby-catch-arena).
   - Laissez-le en Public.
   - Ne cochez PAS "Add a README file" ni "Add .gitignore".

2. Ouvrez un terminal / invite de commandes (cmd) dans ce dossier et tapez :
   git init
   git add .
   git commit -m "Rugby Catch Arena PWA"
   git branch -M main
   git remote add origin https://github.com/VOTRE_PSEUDO/rugby-catch-arena.git
   git push -u origin main

3. Activez GitHub Pages pour jouer depuis n'importe quelle tablette :
   - Sur votre depot GitHub, allez dans : Settings > Pages
   - Dans "Build and deployment" > "Source", selectionnez : "GitHub Actions"
   - Le workflow automatique (.github/workflows/deploy.yml) compile et met
     le jeu en ligne instantanement !
   - L'adresse sera : https://VOTRE_PSEUDO.github.io/rugby-catch-arena/

4. Sur votre tablette (iPad ou Android) :
   - Ouvrez cette adresse dans le navigateur de votre tablette.
   - Sur iPad (Safari) : touchez 'Partager' puis 'Sur l'ecran d'accueil'.
   - Sur Android (Chrome) : touchez le bouton vert 'Installer l'App' en haut
     ou menu ⋮ > 'Installer l'application'.
   - Le jeu s'ouvrira en plein ecran sans navigateur et fonctionne 100% hors-ligne !

------------------------------------------------------------------------
REGLES RAPIDES DU JEU :
------------------------------------------------------------------------
- Mode Tournoi (Tour par Tour) :
  Chaque joueur joue a son tour. 3 ballons surgissent pendant 2 secondes.
  Attrapez-les au vol pour marquer des points (+1 pt).
  Attention aux fruits trompeurs et aux mines (-2 pts) selon la difficulte !

- Mode Cauchemar :
  Les 3 ballons apparaissent EN MEME TEMPS pendant 5 secondes,
  au milieu d'un deluge de fruits et de mines explosives !

- Mode Solo Infini :
  Session sans fin ! Activez ou desactivez les fruits, les mines,
  le mode cauchemar et l'acceleration (3s -> 1s) EN DIRECT pendant le jeu.

Bon match dans l'arene de rugby ! 🏉
========================================================================

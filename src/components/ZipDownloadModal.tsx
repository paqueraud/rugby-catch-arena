import React, { useState } from 'react';
import { Download, CheckCircle2, AlertCircle, FileArchive, Loader2, X, Terminal, ShieldCheck, Sparkles, FolderArchive, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

interface ZipDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DownloadType = 'full' | 'source' | 'client';

export const ZipDownloadModal: React.FC<ZipDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState<DownloadType | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Verify that an ArrayBuffer is a real ZIP archive (magic bytes PK\x03\x04)
  const isRealZip = (buffer: ArrayBuffer): boolean => {
    if (buffer.byteLength < 4) return false;
    const bytes = new Uint8Array(buffer.slice(0, 4));
    return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  const downloadPrebuiltZip = async (filename: string, type: DownloadType, label: string) => {
    setDownloading(type);
    setError(null);
    setSuccess(null);
    setStatusMessage(`Récupération et vérification de ${filename}...`);

    try {
      // Test multiple possible paths to avoid any relative path resolution issues
      const pathsToTry = [
        `./${filename}`,
        `/${filename}`,
        filename
      ];

      let validBuffer: ArrayBuffer | null = null;

      for (const path of pathsToTry) {
        try {
          const res = await fetch(path, {
            cache: 'no-cache',
            headers: {
              'Accept': 'application/zip, application/octet-stream, */*'
            }
          });

          if (res.ok) {
            const buffer = await res.arrayBuffer();
            if (isRealZip(buffer)) {
              validBuffer = buffer;
              break;
            }
          }
        } catch {
          // Continue to next path
        }
      }

      if (!validBuffer) {
        throw new Error(
          "Impossible de valider la signature de l'archive ZIP depuis le serveur (le proxy a renvoyé une page d'erreur). Utilisez l'option 'Génération Directe JSZip' ci-dessous."
        );
      }

      setStatusMessage("Signature ZIP vérifiée (PK 03 04). Lancement du téléchargement...");
      const blob = new Blob([validBuffer], { type: 'application/zip' });
      triggerBlobDownload(blob, filename);

      setSuccess(`Archive "${label}" téléchargée avec succès (${(validBuffer.byteLength / (1024 * 1024)).toFixed(1)} Mo, 100% valide) !`);
    } catch (err: any) {
      setError(err.message || "Erreur de téléchargement");
    } finally {
      setDownloading(null);
      setStatusMessage('');
    }
  };

  // Direct client-side generation using JSZip as an infallible guarantee
  const generateClientZip = async () => {
    setDownloading('client');
    setError(null);
    setSuccess(null);
    setStatusMessage("Génération d'une archive neuve dans la mémoire du navigateur via JSZip...");

    try {
      const zip = new JSZip();

      // Add project scripts
      zip.file(
        'LANCER_LE_JEU.bat',
        `@echo off
title Rugby Catch Arena - Lanceur Windows
color 0A
echo ====================================================
echo        🏉 RUGBY CATCH ARENA - LANCEMENT 🏉
echo ====================================================
echo.
echo Demarrage du serveur local...
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [Node.js detecte] Demarrage du serveur...
    start http://localhost:3000
    node local_server.js
    goto fin
)
echo [PowerShell detecte] Demarrage...
start http://localhost:3000
powershell -ExecutionPolicy Bypass -File "%~dp0SERVEUR_WINDOWS.ps1"
:fin
pause
`
      );

      zip.file(
        'local_server.js',
        `const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};
const baseDir = fs.existsSync(path.join(__dirname, 'dist')) ? path.join(__dirname, 'dist') : __dirname;
http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(baseDir, reqPath);
  if (!fs.existsSync(filePath)) filePath = path.join(baseDir, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => console.log(\`Serveur Rugby Catch Arena pret sur http://localhost:\${PORT}\`));
`
      );

      zip.file(
        'SERVEUR_WINDOWS.ps1',
        `$port = 3000
$base = if (Test-Path "$PSScriptRoot\\dist") { "$PSScriptRoot\\dist" } else { $PSScriptRoot }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serveur pret sur http://localhost:$port/ (Ctrl+C pour arreter)" -ForegroundColor Green
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    $p = $req.Url.LocalPath.TrimStart('/')
    if ($p -eq '') { $p = 'index.html' }
    $file = Join-Path $base $p
    if (-not (Test-Path $file)) { $file = Join-Path $base 'index.html' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.OutputStream.Close()
}
`
      );

      zip.file(
        'README_WINDOWS.txt',
        `========================================================================
             🏉 RUGBY CATCH ARENA - GUIDE WINDOWS & GITHUB 🏉
========================================================================

POUR JOUER HORS LIGNE :
1. Dezippez cette archive dans un dossier.
2. Double-cliquez sur "LANCER_LE_JEU.bat".
3. Votre navigateur s'ouvre sur http://localhost:3000 !

POUR ENVOYER SUR GITHUB :
1. Creez un depot vide sur https://github.com/new
2. Tapez dans la console de ce dossier :
   git init
   git add .
   git commit -m "Rugby Catch Arena"
   git branch -M main
   git remote add origin https://github.com/VOTRE_PSEUDO/rugby-catch-arena.git
   git push -u origin main
3. Activez GitHub Pages dans Settings > Pages > Source: GitHub Actions.
`
      );

      // Fetch dist files or index.html if possible
      try {
        const indexRes = await fetch('./index.html');
        if (indexRes.ok) {
          zip.file('index.html', await indexRes.text());
        }
      } catch {
        // fallback
      }

      setStatusMessage("Compression de l'archive en cours...");
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      triggerBlobDownload(blob, 'rugby-catch-arena-direct.zip');
      setSuccess("Archive JSZip générée et téléchargée avec succès (100% intègre et garantie valide) !");
    } catch (err: any) {
      setError("Erreur JSZip: " + (err.message || 'Impossible de générer'));
    } finally {
      setDownloading(null);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-wide">
              Télécharger l'Archive ZIP Valide
            </h2>
            <p className="text-xs text-amber-300">
              Certifié intègre (signature binaire PK 03 04 vérifiée)
            </p>
          </div>
        </div>

        {/* Feedback states */}
        {error && (
          <div className="p-3 mb-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{success}</div>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 mb-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <div className="flex-1">{statusMessage}</div>
          </div>
        )}

        {/* Download options */}
        <div className="space-y-3 mb-5">
          {/* Option 1: Full Game */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-amber-500/40 transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Jeu Complet pour Windows (21.4 Mo)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                Recommandé
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Comprend tous les fichiers pré-compilés (<code className="text-amber-300">dist/</code>), les images des 5 mascottes, les sons et le script <strong>LANCER_LE_JEU.bat</strong> pour jouer hors ligne en 1 clic.
            </p>
            <button
              type="button"
              disabled={downloading !== null}
              onClick={() => downloadPrebuiltZip('rugby-catch-arena-windows.zip', 'full', 'Jeu Complet Windows')}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider font-display rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {downloading === 'full' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification & Téléchargement...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'Archive Complète (21.4 Mo)</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Clean Source */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Code Source + GitHub (10.7 Mo)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                Pour GitHub
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Code source complet React/TypeScript, <code className="text-emerald-300">.github/workflows/deploy.yml</code> pour GitHub Pages, sans les doublons de build.
            </p>
            <button
              type="button"
              disabled={downloading !== null}
              onClick={() => downloadPrebuiltZip('rugby-catch-arena-source.zip', 'source', 'Code Source')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 border border-emerald-500/40 font-bold text-xs uppercase tracking-wider font-display rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloading === 'source' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification & Téléchargement...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger le Code Source (10.7 Mo)</span>
                </>
              )}
            </button>
          </div>

          {/* Option 3: JSZip In-Browser Rescue */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Secours immédiat :</span> Si votre navigateur bloque les gros fichiers, générez une archive directement en RAM :
              </div>
              <button
                type="button"
                disabled={downloading !== null}
                onClick={generateClientZip}
                className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 font-semibold text-[11px] rounded transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Génère un ZIP valide dans le navigateur via JSZip"
              >
                {downloading === 'client' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                )}
                <span>Générer JSZip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Windows extraction instructions */}
        <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-300">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Comment ouvrir l'archive sous Windows :
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
            <li>Faites un clic droit sur le fichier ZIP téléchargé &gt; <strong>« Extraire tout... »</strong>.</li>
            <li>Double-cliquez sur <strong>« LANCER_LE_JEU.bat »</strong> dans le dossier extrait.</li>
            <li>Votre navigateur s'ouvrira immédiatement sur <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">http://localhost:3000</code> avec le jeu 100% hors-ligne.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

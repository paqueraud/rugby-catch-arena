# Serveur HTTP local autonome natif Windows PowerShell (aucun logiciel tiers requis)
param([int]$port = 3000)

$distPath = Join-Path $PSScriptRoot "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "[ERREUR] Le dossier 'dist' est introuvable." -ForegroundColor Red
    exit 1
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    # Port déjà occupé, tente un autre port
    $port = $port + 1
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "===========================================================" -ForegroundColor Green
Write-Host "   RUGBY CATCH ARENA - SERVEUR LOCAL POWERSHELL DEMARRE   " -ForegroundColor Yellow
Write-Host "   Adresse : $prefix" -ForegroundColor Cyan
Write-Host "   Pour arreter le serveur : fermez cette fenetre.        " -ForegroundColor Gray
Write-Host "===========================================================" -ForegroundColor Green

# Ouvre le navigateur
Start-Process $prefix

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($urlPath)) {
        $urlPath = "index.html"
    }

    $filePath = Join-Path $distPath $urlPath
    if (-not (Test-Path $filePath) -or (Test-Path $filePath -PathType Container)) {
        $filePath = Join-Path $distPath "index.html"
    }

    try {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = $mimeTypes[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }
        $response.ContentType = $contentType

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.StatusCode = 200
    } catch {
        $response.StatusCode = 500
    } finally {
        $response.OutputStream.Close()
    }
}

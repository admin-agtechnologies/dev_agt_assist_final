# deploy_dicts.ps1
# Utilisation : depuis la RACINE de ton projet Next.js
# .\deploy_dicts.ps1
#
# Prérequis : avoir extrait agt_dicts_fix.zip dans ~/Downloads/agt_dicts_fix/

$projectRoot = Get-Location
$zipExtractDir = "$env:USERPROFILE\Downloads\agt_dicts_fix"

if (-not (Test-Path $zipExtractDir)) {
    Write-Error "Dossier introuvable : $zipExtractDir"
    Write-Host "Extrais d'abord le zip dans $zipExtractDir"
    exit 1
}

$srcDir = Join-Path $zipExtractDir "src"
if (-not (Test-Path $srcDir)) {
    Write-Error "Structure incorrecte. Le zip doit contenir un dossier 'src' a la racine."
    exit 1
}

Write-Host "Deploiement depuis : $zipExtractDir"
Write-Host "Vers : $projectRoot"
Write-Host ""

# Copier tout le contenu de src/ vers src/ du projet
$files = Get-ChildItem -Path $srcDir -Recurse -File

foreach ($file in $files) {
    # Chemin relatif depuis le dossier src/ du zip
    $relativePath = $file.FullName.Substring($srcDir.Length + 1)
    
    # Chemin destination dans le projet
    $destPath = Join-Path $projectRoot "src" $relativePath
    
    # Créer le dossier si besoin
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Write-Host "  [MKDIR] $destDir"
    }
    
    # Copier le fichier
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "  [OK]    src\$relativePath"
}

Write-Host ""
Write-Host "Deploiement termine. $($files.Count) fichiers copies."
Write-Host ""
Write-Host "Lance maintenant : npx tsc --noEmit"
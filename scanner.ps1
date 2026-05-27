<#
.SYNOPSIS
Extrait le code source d'un projet Next.js pour l'utiliser comme contexte IA.
FIX : Exclusion dynamique de toutes les instances .next-* via Regex.
#>

param (
    [string]$ProjectPath = "."
)

$OutputFilename = "contexte_frontend_PME.txt"

# Résolution du chemin absolu
try {
    $ResolvedPath = (Resolve-Path $ProjectPath -ErrorAction Stop).Path
} catch {
    Write-Error "Erreur: Répertoire invalide ($ProjectPath)."
    exit 1
}

$OutputFile = Join-Path $ResolvedPath $OutputFilename

# Suppression de l'ancien fichier volumineux s'il existe
if (Test-Path $OutputFile) {
    Remove-Item $OutputFile -Force
}

# Dossiers à ignorer (Utilisation de patterns Regex pour tout bloquer d'un coup)
$ExcludeDirsPatterns = @(
    "^\.git$", "^\.vscode$", "^\.idea$", "^node_modules$", 
    "^\.next.*",       # Bloque TOUTES tes instances : .next, .next-banking, .next-pme, etc.
    "^out$", "^build$", "^coverage$", "^public$", "^dist$", "^\.vercel$",
    "^db$", "^docs$",  # Dossiers annexes souvent inutiles pour le prompt frontend
    ".*cache.*"        # Sécurité pour le cache webpack
)

# Extensions autorisées pour le prompt engineering (Filtre blanc strict)
$AllowedExtensions = @(
    ".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss", 
    ".html", ".md", ".mdx", ".config"
)

# Fichiers spécifiques à ignorer
$ExcludeFiles = @(
    "*.log", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
    "*.map", "*.tsbuildinfo", # Supprime les sourcemaps et fichiers de build TS transitoires
    $OutputFilename,
    "contexte_frontend",
    "contexte_admin"
)

# Fonction pour vérifier si un fichier est binaire
function Test-IsBinary {
    param ([string]$FilePath)
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        $checkLength = [math]::Min(1024, $bytes.Length)
        for ($i = 0; $i -lt $checkLength; $i++) {
            if ($bytes[$i] -eq 0) { return $true }
        }
        return $false
    } catch {
        return $true
    }
}

$foundFiles = [System.Collections.Generic.List[string]]::new()

function Get-ValidFiles {
    param ([string]$CurrentDir)
    
    $items = Get-ChildItem -Path $CurrentDir -Force -ErrorAction SilentlyContinue
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            # Filtrage des dossiers par expression régulière
            $skipDir = $false
            foreach ($pattern in $ExcludeDirsPatterns) {
                if ($item.Name -match $pattern) {
                    $skipDir = $true
                    break
                }
            }
            if (-not $skipDir) {
                Get-ValidFiles -CurrentDir $item.FullName
            }
        } else {
            # Éviter d'écrire dans le fichier de sortie en cours de route
            if ($item.FullName -eq $OutputFile) { continue }

            # Vérification de l'extension
            $ext = [System.IO.Path]::GetExtension($item.Name).ToLower()
            if ($AllowedExtensions -notcontains $ext -and $item.Name -notlike ".env*") {
                continue
            }

            # Vérification des fichiers exclus
            $skip = $false
            foreach ($pattern in $ExcludeFiles) {
                if ($item.Name -like $pattern) {
                    $skip = $true
                    break
                }
            }
            if (-not $skip) {
                $foundFiles.Add($item.FullName)
            }
        }
    }
}

Write-Host "Recherche des fichiers en cours..." -ForegroundColor Cyan
Get-ValidFiles -CurrentDir $ResolvedPath
Write-Host "  -> $($foundFiles.Count) fichiers sources valides trouvés." -ForegroundColor Gray

# ==============================================================================
# ÉCRITURE UNIQUE VIA STREAMWRITER
# ==============================================================================

$dateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$header = @"
Next.js Multi-Instance Project Context
Generated On: $dateStr
Root: $ResolvedPath
===============================================
"@

Write-Host "Génération du fichier de contexte en cours..." -ForegroundColor Cyan

$stream = [System.IO.StreamWriter]::new($OutputFile, $false, [System.Text.Encoding]::UTF8)

try {
    $stream.WriteLine($header)

    $count = 0
    foreach ($file in $foundFiles) {
        $count++
        $relativePath = $file.Substring($ResolvedPath.Length).TrimStart('\')
        $relativePath = $relativePath -replace '\\', '/'

        # En-tête de séparation pour l'IA
        $stream.WriteLine("")
        $stream.WriteLine("// FILE: $relativePath")
        $stream.WriteLine("-----------------------------------------------")

        if (Test-IsBinary -FilePath $file) {
            $stream.WriteLine("[Fichier binaire ou asset omis]")
        } else {
            try {
                $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
                if ($null -ne $content) {
                    $stream.Write($content)
                    if (-not $content.EndsWith("`n")) {
                        $stream.WriteLine("")
                    }
                }
            } catch {
                $stream.WriteLine("[Erreur lors de la lecture du fichier]")
            }
        }

        $stream.WriteLine("")
        $stream.WriteLine("// END OF FILE: $relativePath")

        if ($count % 50 -eq 0) {
            Write-Host "  -> $count / $($foundFiles.Count) fichiers traités..." -ForegroundColor Gray
        }
    }
} finally {
    $stream.Close()
    $stream.Dispose()
}

$sizeMB = [math]::Round((Get-Item $OutputFile).Length / 1MB, 2)
Write-Host ""
Write-Host "Succès ! Le contexte est enfin propre :" -ForegroundColor Green
Write-Host "  Fichier : $OutputFile" -ForegroundColor Green
Write-Host "  Fichiers inclus : $count" -ForegroundColor Green
Write-Host "  Taille finale : $sizeMB MB" -ForegroundColor Green
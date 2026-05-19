#!/usr/bin/env bash

set -u

ProjectPath="${1:-.}"
OutputFilename="contexte_frontend_PME.txt"

if ! ResolvedPath="$(cd "$ProjectPath" 2>/dev/null && pwd -P)"; then
  echo "Erreur: Répertoire invalide ($ProjectPath)." >&2
  exit 1
fi

OutputFile="$ResolvedPath/$OutputFilename"

if [ -f "$OutputFile" ]; then
  rm -f "$OutputFile"
fi

# Dossiers à ignorer (Support des jokers grâce au globbing dans les vérifications)
ExcludeDirs=(
  ".git" ".vscode" ".idea" "node_modules" 
  ".next*"       # Bloque .next, .next-banking, .next-pme, etc.
  "out" "build" "coverage" "public" "dist" ".vercel"
  "db" "docs"    # Dossiers annexes ignorés
  "*cache*"      # Sécurité pour le cache webpack
)

# Extensions autorisées pour le prompt engineering (Filtre strict)
AllowedExtensions=(
  "js" "jsx" "ts" "tsx" "json" "css" "scss" "html" "md" "mdx" "config"
)

# Fichiers spécifiques à ignorer
ExcludeFiles=(
  "*.log" "package-lock.json" "yarn.lock" "pnpm-lock.yaml" "bun.lockb"
  "*.map" "tsconfig.tsbuildinfo" # Élimine les sourcemaps et résidus TS
  "$OutputFilename"
  "contexte_frontend"
  "contexte_admin"
)

is_excluded_dir() {
  local dir_name="$1"
  local d
  for d in "${ExcludeDirs[@]}"; do
    # Utilisation du pattern matching de Bash (indispensable pour les jokers comme .next*)
    [[ "$dir_name" == $d ]] && return 0
  done
  return 1
}

is_excluded_file() {
  local file_name="$1"
  local p
  for p in "${ExcludeFiles[@]}"; do
    [[ "$file_name" == $p ]] && return 0
  done
  return 1
}

is_allowed_extension() {
  local file_name="$1"
  # Gérer les fichiers de config particuliers comme .env.local
  [[ "$file_name" == .env* ]] && return 0
  
  local ext="${file_name##*.}"
  # Si le fichier n'a pas d'extension
  [[ "$ext" == "$file_name" ]] && return 1
  
  local e
  for e in "${AllowedExtensions[@]}"; do
    [[ "${ext,,}" == "$e" ]] && return 0
  done
  return 1
}

is_binary_file() {
  local file_path="$1"

  if [ ! -s "$file_path" ]; then
    return 1
  fi

  if grep -Iq . "$file_path" 2>/dev/null; then
    return 1
  fi

  return 0
}

found_files=()

get_valid_files() {
  local current_dir="$1"
  local item base_name

  while IFS= read -r -d '' item; do
    base_name="$(basename "$item")"

    if [ -d "$item" ]; then
      if ! is_excluded_dir "$base_name"; then
        get_valid_files "$item"
      fi
    else
      if [ "$item" = "$OutputFile" ]; then
        continue
      fi

      # Vérification stricte : Extension autorisée ET fichier non exclu explicitement
      if is_allowed_extension "$base_name" && ! is_excluded_file "$base_name"; then
        found_files+=("$item")
      fi
    fi
  done < <(find "$current_dir" -mindepth 1 -maxdepth 1 -print0 2>/dev/null)
}

echo "Recherche des fichiers en cours..."
get_valid_files "$ResolvedPath"
echo "  -> ${#found_files[@]} fichiers sources valides trouvés."

dateStr="$(date '+%Y-%m-%d %H:%M:%S')"
count=0

echo "Génération du fichier de contexte en cours..."

# On ouvre le bloc d'écriture vers le fichier de sortie unique
{
  printf '%s\n' "Next.js Multi-Instance Project Context (Linux/macOS)"
  printf '%s\n' "Generated On: $dateStr"
  printf '%s\n' "Root: $ResolvedPath"
  printf '%s\n' "==============================================="

  for file in "${found_files[@]}"; do
    count=$((count + 1))

    relativePath="${file#"$ResolvedPath"/}"
    relativePath="${relativePath//\\//}"

    printf '\n'
    printf '%s\n' "// FILE: $relativePath"
    printf '%s\n' "-----------------------------------------------"

    if is_binary_file "$file"; then
      printf '%s\n' "[Fichier binaire ou asset omis]"
    else
      if content="$(cat "$file" 2>/dev/null)"; then
        if [ -n "$content" ]; then
          printf '%s\n' "$content"
          [[ "$content" != *$'\n' ]] && printf '\n'
        fi
      else
        printf '%s\n' "[Erreur lors de la lecture du fichier]"
      fi
    fi

    printf '\n'
    printf '%s\n' "// END OF FILE: $relativePath"

    # Affichage de la progression sur la sortie d'erreur standard (stderr) 
    # pour éviter de polluer le fichier texte généré
    if (( count % 50 == 0 )); then
      echo "  -> $count / ${#found_files[@]} fichiers traités..." >&2
    fi
  done
} > "$OutputFile"

sizeMB=$(awk -v bytes="$(wc -c < "$OutputFile")" 'BEGIN { printf "%.2f", bytes / 1024 / 1024 }')

echo
echo "Succès ! Le contexte Unix est enfin propre :"
echo "  Fichier : $OutputFile"
echo "  Fichiers inclus : $count"
echo "  Taille finale : $sizeMB MB"
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

ExcludeDirs=(
  ".git" ".vscode" ".idea" "node_modules" ".next"
  "out" "build" "coverage" "public" "dist" ".vercel"
)

ExcludeFiles=(
  "*.log" "package-lock.json" "yarn.lock" "pnpm-lock.yaml" "bun.lockb"
  ".env*" "*.ico" "*.png" "*.jpg" "*.jpeg" "*.svg" "*.webp"
  "*.pdf" "*.map" "*.ttf" "*.woff" "*.woff2" "*.eot" "*.mp4"
  "$OutputFilename"
  "contexte_frontend"
  "contexte_admin"
)

is_excluded_dir() {
  local dir_name="$1"
  local d
  for d in "${ExcludeDirs[@]}"; do
    [[ "$dir_name" == "$d" ]] && return 0
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

      if ! is_excluded_file "$base_name"; then
        found_files+=("$item")
      fi
    fi
  done < <(find "$current_dir" -mindepth 1 -maxdepth 1 -print0 2>/dev/null)
}

echo "Recherche des fichiers en cours..."
get_valid_files "$ResolvedPath"
echo "  -> ${#found_files[@]} fichiers trouvés."

dateStr="$(date '+%Y-%m-%d %H:%M:%S')"

count=0

{
  printf '%s\n' "Next.js Project Context"
  printf '%s\n' "Generated On: $dateStr"
  printf '%s\n' "Root: $ResolvedPath"
  printf '%s\n' "==============================================="

  echo "Génération du fichier de contexte en cours..."

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

    if (( count % 50 == 0 )); then
      echo "  -> $count / ${#found_files[@]} fichiers traités..."
    fi
  done
} > "$OutputFile"

sizeMB=$(awk -v bytes="$(wc -c < "$OutputFile")" 'BEGIN { printf "%.2f", bytes / 1024 / 1024 }')

echo
echo "Succès ! Contexte Next.js prêt :"
echo "  Fichier : $OutputFile"
echo "  Fichiers inclus : $count"
echo "  Taille : $sizeMB MB"
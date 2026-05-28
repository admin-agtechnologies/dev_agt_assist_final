#!/bin/bash
# ============================================================
# prompter.sh — Générateur de contexte projet MAKORA
# Version 2.0 — Mai 2026
#
# Trois comportements selon le fichier/dossier :
#
#  1. EXCLUS TOTALEMENT (ni contenu ni mention)
#     → caches, builds, dépendances, artefacts OS
#
#  2. LISTÉS SEULEMENT (chemin + taille, pas de contenu)
#     → données volumineuses : models, splits, processed,
#       figures PNG, résultats binaires/JSON lourds
#     → EXCEPTION : le dossier context/ est toujours inclus
#       en contenu complet, quoi qu'il arrive
#
#  3. INCLUS EN CONTENU COMPLET
#     → tout le code source, configs, tests, scripts
#     → tout le dossier context/ sans exception
#     → petits fichiers JSON de métriques dans results/
#
# Usage :
#   ./prompter.sh                      # depuis la racine du projet
#   ./prompter.sh /chemin/vers/projet
# ============================================================

# --- Configuration ---

DEFAULT_PROJECT_PATH="."
PROJECT_PATH=${1:-"$DEFAULT_PROJECT_PATH"}
OUTPUT_FILENAME="project_context.txt"

# ── 1. Dossiers exclus TOTALEMENT ───────────────────────────
# Ni contenu ni listing — complètement ignorés
EXCLUDE_DIRS_PATTERN=(
    ".*"            # .git, .vscode, .idea, .mypy_cache, .pytest_cache...
    "node_modules"
    "vendor"
    "build"
    "dist"
    "target"
    "__pycache__"
    ".next"
    "cache"
    "venv"
    ".venv"
    "env"
    "storage"
)

# ── 2. Dossiers listés SEULEMENT (chemin, pas de contenu) ───
# IMPORTANT : context/ n'est jamais dans cette liste
LISTING_ONLY_DIRS=(
    "data/raw"           # Données brutes sources (gitignored)
    "data/processed"     # Parquet finalisés (100k–140k lignes)
    "data/splits"        # Splits train/val/test immutables
    "data/models"        # Fichiers .joblib, .npy — binaires entraînés
    "data/referentials"  # Mercuriales YAML/JSON (souvent volumineux)
    "results/figures"    # PNG matplotlib — figures mémoire
)

# ── 3a. Extensions toujours listées seulement ───────────────
LISTING_ONLY_EXTENSIONS=(
    "parquet"
    "joblib"
    "pkl"
    "npy"
    "h5"
    "pt"
    "bin"
    "png"
    "jpg"
    "jpeg"
    "gif"
)

# ── 3b. Fichiers JSON résultats trop lourds → listing only ──
# Tous les JSON dans results/ sont listés sauf ceux ci-dessous
RESULTS_JSON_INCLUDE_CONTENT=(
    "metrics_final.json"
    "t10_3_if_results.json"
    "t10_4_challengers_results.json"
    "t10_5_learning_curves.json"
    "t10_7_comparative_table.json"
    "t12_1_models_metrics.json"
    "t12_2_delta_results.json"
    "convergence_report.json"
    "rif_results.json"
    "eif_params.json"
    "model_card.json"
    "eda_overview.json"
    "eda_report.md"
)

# ── 4. Fichiers exclus TOTALEMENT (parasites, inutiles) ─────
EXCLUDE_FILES_EXACT=(
    "project_context.txt"
    "sys"                  # Artefact parasite détecté dans l'inventaire
)

# ── 5. Patterns de fichiers exclus totalement ───────────────
EXCLUDE_FILES_PATTERN=(
    "*.log"
    "*.jar"
    "*.pdf"
    "*.class"
    "*.sqlite"
    "*.ico"
    "*.swp"
    "*.bak"
    "*.tmp"
    "package-lock.json"
    "yarn.lock"
    "composer.lock"
    "pnpm-lock.yaml"
)

# ============================================================
# --- Script Logic ---
# ============================================================

PROJECT_PATH=$(realpath "$PROJECT_PATH" 2>/dev/null)
if [ $? -ne 0 ] || [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Invalid or non-existent project directory specified." >&2
    exit 1
fi

OUTPUT_FILE="$PROJECT_PATH/$OUTPUT_FILENAME"
rm -f "$OUTPUT_FILE"

# ── Helper : fichier dans un dossier listing-only ? ─────────
is_in_listing_only_dir() {
    local rel_path="$1"
    for dir in "${LISTING_ONLY_DIRS[@]}"; do
        if [[ "$rel_path" == "$dir/"* || "$rel_path" == "$dir" ]]; then
            return 0
        fi
    done
    return 1
}

# ── Helper : extension listing-only ? ───────────────────────
has_listing_only_ext() {
    local filename="$1"
    local ext="${filename##*.}"
    ext="${ext,,}"
    for e in "${LISTING_ONLY_EXTENSIONS[@]}"; do
        if [[ "$ext" == "$e" ]]; then
            return 0
        fi
    done
    return 1
}

# ── Helper : JSON results à lister seulement ? ──────────────
is_heavy_results_json() {
    local rel_path="$1"
    local filename="$2"
    # Uniquement les JSON hors context/ dans results/
    if [[ "$rel_path" == results/* ]] && [[ "$filename" == *.json ]]; then
        for keep in "${RESULTS_JSON_INCLUDE_CONTENT[@]}"; do
            if [[ "$filename" == "$keep" ]]; then
                return 1  # À inclure en contenu
            fi
        done
        return 0  # JSON results lourd → listing only
    fi
    return 1
}

# ── Helper : fichier exclu totalement ? ─────────────────────
is_excluded() {
    local rel_path="$1"
    local filename="$2"

    # Exclusions exactes
    for excl in "${EXCLUDE_FILES_EXACT[@]}"; do
        if [[ "$filename" == "$excl" ]]; then
            return 0
        fi
    done

    # Exclusions par pattern
    for pattern in "${EXCLUDE_FILES_PATTERN[@]}"; do
        case "$filename" in
            $pattern) return 0 ;;
        esac
    done

    return 1
}

# ── Construction find (exclut totalement les dossiers cachés) ─

find_args=("$PROJECT_PATH")

if [ ${#EXCLUDE_DIRS_PATTERN[@]} -gt 0 ]; then
    find_args+=(\()
    first=true
    for dir_pattern in "${EXCLUDE_DIRS_PATTERN[@]}"; do
        if ! $first; then
            find_args+=(-o)
        fi
        find_args+=(-name "$dir_pattern" -type d)
        first=false
    done
    find_args+=(\) -prune -o)
fi

find_args+=(\( -type f -not -path "$OUTPUT_FILE" -print \))

# ── En-tête du fichier de sortie ────────────────────────────

{
    echo "Project Context From: $PROJECT_PATH"
    echo "Generated On: $(date)"
    echo "==============================================="
    echo "Strategy:"
    echo "  - context/ : always included in full (no exceptions)"
    echo "  - Code, tests, scripts, configs : full content"
    echo "  - data/models, data/splits, data/processed, data/raw,"
    echo "    data/referentials, results/figures : name+path only"
    echo "  - Binary extensions (.parquet .joblib .npy .png...) : name+path only"
    echo "  - Heavy results JSON : name+path only"
    echo "  - Caches, builds, node_modules, .git : fully excluded"
    echo "==============================================="
    echo ""
} > "$OUTPUT_FILE"

# ── Index des fichiers listing-only ─────────────────────────
# Construit en premier pour donner une vue d'ensemble des données

{
    echo "// ============================================================"
    echo "// LARGE FILES INDEX — Path only (content not included)"
    echo "// These files exist on disk and are referenced by the code."
    echo "// ============================================================"
    echo ""
} >> "$OUTPUT_FILE"

for listing_dir in "${LISTING_ONLY_DIRS[@]}"; do
    full_dir="$PROJECT_PATH/$listing_dir"
    if [ -d "$full_dir" ]; then
        echo "// --- $listing_dir/ ---" >> "$OUTPUT_FILE"
        find "$full_dir" -type f | sort | while IFS= read -r fpath; do
            rel="${fpath#$PROJECT_PATH/}"
            # Taille
            if stat --version 2>/dev/null | grep -q GNU; then
                bytes=$(stat -c%s "$fpath" 2>/dev/null || echo 0)
            else
                bytes=$(stat -f%z "$fpath" 2>/dev/null || echo 0)
            fi
            if [ "$bytes" -ge 1048576 ]; then
                hr=$(echo "scale=1; $bytes/1048576" | bc)"M"
            elif [ "$bytes" -ge 1024 ]; then
                hr=$(echo "scale=0; $bytes/1024" | bc)"K"
            else
                hr="${bytes}B"
            fi
            echo "// [FILE] $rel  ($hr)" >> "$OUTPUT_FILE"
        done
        echo "" >> "$OUTPUT_FILE"
    fi
done

{
    echo "// ============================================================"
    echo "// END OF LARGE FILES INDEX"
    echo "// ============================================================"
    echo ""
} >> "$OUTPUT_FILE"

# ── Parcours principal ───────────────────────────────────────

error_count=0

while IFS= read -r FILE_PATH; do
    RELATIVE_PATH="${FILE_PATH#$PROJECT_PATH/}"
    FILENAME=$(basename "$FILE_PATH")

    # --- 1. Exclusion totale ?
    if is_excluded "$RELATIVE_PATH" "$FILENAME"; then
        continue
    fi

    # --- 2. Dans context/ ? → toujours contenu complet
    if [[ "$RELATIVE_PATH" == context/* ]]; then
        {
            echo "//---> PATH: $FILE_PATH"
            echo ""
        } >> "$OUTPUT_FILE"
        if ! cat "$FILE_PATH" >> "$OUTPUT_FILE" 2>/dev/null; then
            echo "[Error reading file: $RELATIVE_PATH]" >> "$OUTPUT_FILE"
            ((error_count++))
        fi
        {
            echo ""
            echo "// END OF FILE: $RELATIVE_PATH"
            echo ""
        } >> "$OUTPUT_FILE"
        continue
    fi

    # --- 3. Dans un dossier listing-only ?
    if is_in_listing_only_dir "$RELATIVE_PATH"; then
        # Déjà indexé dans la section LARGE FILES INDEX ci-dessus
        continue
    fi

    # --- 4. Extension binaire/image listing-only ?
    if has_listing_only_ext "$FILENAME"; then
        # Taille
        if stat --version 2>/dev/null | grep -q GNU; then
            bytes=$(stat -c%s "$FILE_PATH" 2>/dev/null || echo 0)
        else
            bytes=$(stat -f%z "$FILE_PATH" 2>/dev/null || echo 0)
        fi
        if [ "$bytes" -ge 1048576 ]; then
            hr=$(echo "scale=1; $bytes/1048576" | bc)"M"
        elif [ "$bytes" -ge 1024 ]; then
            hr=$(echo "scale=0; $bytes/1024" | bc)"K"
        else
            hr="${bytes}B"
        fi
        echo "// [FILE] $RELATIVE_PATH  ($hr)" >> "$OUTPUT_FILE"
        continue
    fi

    # --- 5. JSON lourd dans results/ ?
    if is_heavy_results_json "$RELATIVE_PATH" "$FILENAME"; then
        if stat --version 2>/dev/null | grep -q GNU; then
            bytes=$(stat -c%s "$FILE_PATH" 2>/dev/null || echo 0)
        else
            bytes=$(stat -f%z "$FILE_PATH" 2>/dev/null || echo 0)
        fi
        if [ "$bytes" -ge 1024 ]; then
            hr=$(echo "scale=0; $bytes/1024" | bc)"K"
        else
            hr="${bytes}B"
        fi
        echo "// [FILE] $RELATIVE_PATH  ($hr)" >> "$OUTPUT_FILE"
        continue
    fi

    # --- 6. Contenu complet (code, configs, tests, docs, petits JSON)
    {
        echo "//---> PATH: $FILE_PATH"
        echo ""
    } >> "$OUTPUT_FILE"

    if file -b "$FILE_PATH" 2>/dev/null | grep -q -E 'binary|archive|compressed|font'; then
        echo "[Non-text file — contents omitted]" >> "$OUTPUT_FILE"
    else
        if ! cat "$FILE_PATH" >> "$OUTPUT_FILE" 2>/dev/null; then
            echo "[Error reading file: $RELATIVE_PATH]" >> "$OUTPUT_FILE"
            ((error_count++))
        fi
    fi

    {
        echo ""
        echo "// END OF FILE: $RELATIVE_PATH"
        echo ""
    } >> "$OUTPUT_FILE"

done < <(find "${find_args[@]}" | sort)

if [ $error_count -gt 0 ]; then
    echo "Warning: $error_count error(s) reading file contents." >&2
    exit 1
fi

exit 0

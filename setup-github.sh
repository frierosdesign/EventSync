#!/bin/bash

# 🚀 Script para configurar EventSync en GitHub
# Este script te ayuda a crear y configurar el repositorio en GitHub

set -e

echo "🎉 Configurando EventSync para GitHub..."
echo "========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "README.md" ]; then
    print_error "No se encontró package.json o README.md. Asegúrate de estar en el directorio raíz de EventSync."
    exit 1
fi

# Verificar que Git está inicializado
if [ ! -d ".git" ]; then
    print_error "Git no está inicializado. Ejecuta 'git init' primero."
    exit 1
fi

print_status "Verificando estado del repositorio..."

# Verificar si hay cambios sin commitear
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Hay cambios sin commitear. ¿Quieres hacer commit antes de continuar? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "🔧 Setup: Preparando para GitHub"
        print_status "Cambios commiteados."
    else
        print_warning "Continuando sin commitear cambios..."
    fi
fi

# Solicitar información del usuario
echo ""
print_info "Configuración del repositorio GitHub"
echo "========================================"

echo -n "Ingresa tu nombre de usuario de GitHub: "
read -r github_username

echo -n "Ingresa el nombre del repositorio (default: eventsync): "
read -r repo_name
repo_name=${repo_name:-eventsync}

echo -n "¿Quieres que el repositorio sea público? (y/n, default: y): "
read -r is_public
is_public=${is_public:-y}

echo -n "Ingresa tu email de GitHub: "
read -r github_email

# Configurar Git
print_status "Configurando Git..."
git config user.name "$github_username"
git config user.email "$github_email"

# Crear el repositorio en GitHub usando GitHub CLI
print_status "Creando repositorio en GitHub..."

if command -v gh &> /dev/null; then
    # Usar GitHub CLI si está disponible
    if [[ "$is_public" =~ ^[Yy]$ ]]; then
        gh repo create "$repo_name" --public --description "AI-powered event extraction from Instagram" --source=. --remote=origin --push
    else
        gh repo create "$repo_name" --private --description "AI-powered event extraction from Instagram" --source=. --remote=origin --push
    fi
    print_status "Repositorio creado exitosamente con GitHub CLI!"
else
    # Instrucciones manuales
    print_warning "GitHub CLI no está instalado. Sigue estos pasos manualmente:"
    echo ""
    echo "1. Ve a https://github.com/new"
    echo "2. Nombre del repositorio: $repo_name"
    echo "3. Descripción: AI-powered event extraction from Instagram"
    echo "4. Visibilidad: $([ "$is_public" = "y" ] && echo "Público" || echo "Privado")"
    echo "5. NO inicialices con README, .gitignore, o licencia"
    echo "6. Haz clic en 'Create repository'"
    echo ""
    echo "Después ejecuta estos comandos:"
    echo "git remote add origin https://github.com/$github_username/$repo_name.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    echo ""
    
    echo -n "¿Ya creaste el repositorio en GitHub? (y/n): "
    read -r repo_created
    
    if [[ "$repo_created" =~ ^[Yy]$ ]]; then
        git remote add origin "https://github.com/$github_username/$repo_name.git"
        git branch -M main
        git push -u origin main
        print_status "Repositorio conectado y código subido!"
    else
        print_warning "Ejecuta los comandos manualmente cuando hayas creado el repositorio."
    fi
fi

# Actualizar README con la URL correcta
print_status "Actualizando README con la URL correcta..."
sed -i.bak "s|https://github.com/tu-usuario/eventsync|https://github.com/$github_username/$repo_name|g" README.md
sed -i.bak "s|tu-usuario|$github_username|g" README.md
rm README.md.bak

# Actualizar otros archivos
sed -i.bak "s|tu-usuario|$github_username|g" CONTRIBUTING.md
sed -i.bak "s|tu-usuario|$github_username|g" CHANGELOG.md
rm CONTRIBUTING.md.bak CHANGELOG.md.bak

# Commit de los cambios
git add README.md CONTRIBUTING.md CHANGELOG.md
git commit -m "🔗 docs: actualizar URLs con el repositorio correcto"

# Push de los cambios
if git remote get-url origin &> /dev/null; then
    git push
    print_status "Cambios subidos al repositorio!"
fi

# Crear archivo de configuración local
cat > .github-config << EOF
# Configuración de GitHub para EventSync
GITHUB_USERNAME=$github_username
GITHUB_REPO=$repo_name
GITHUB_EMAIL=$github_email
REPO_URL=https://github.com/$github_username/$repo_name
EOF

print_status "Configuración guardada en .github-config"

# Mostrar información final
echo ""
echo "🎉 ¡EventSync está listo para GitHub!"
echo "======================================"
echo ""
echo "📋 Información del repositorio:"
echo "   Usuario: $github_username"
echo "   Repositorio: $repo_name"
echo "   URL: https://github.com/$github_username/$repo_name"
echo "   Visibilidad: $([ "$is_public" = "y" ] && echo "Público" || echo "Privado")"
echo ""
echo "🔗 Enlaces útiles:"
echo "   📖 Repositorio: https://github.com/$github_username/$repo_name"
echo "   🐛 Issues: https://github.com/$github_username/$repo_name/issues"
echo "   📋 Pull Requests: https://github.com/$github_username/$repo_name/pulls"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Ve a https://github.com/$github_username/$repo_name"
echo "   2. Revisa que todo se vea correcto"
echo "   3. Añade una descripción al repositorio"
echo "   4. Configura topics y etiquetas"
echo "   5. ¡Comparte tu proyecto!"
echo ""
echo "🚀 Para ejecutar el proyecto:"
echo "   npm run dev"
echo ""
print_status "¡Configuración completada exitosamente!" 
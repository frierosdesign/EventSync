# 🚀 Configuración de GitHub para EventSync

Este documento te guía paso a paso para crear y configurar tu repositorio de EventSync en GitHub.

## 📋 Prerrequisitos

- ✅ Git instalado y configurado
- ✅ Cuenta de GitHub
- ✅ Node.js 18+ instalado
- ✅ Proyecto EventSync funcionando localmente

## 🎯 Opción 1: Script Automático (Recomendado)

### 1. Ejecutar el script de configuración

```bash
./setup-github.sh
```

El script te guiará automáticamente a través de:
- Configuración de Git
- Creación del repositorio en GitHub
- Subida del código
- Actualización de URLs en la documentación

### 2. Seguir las instrucciones del script

El script te pedirá:
- Tu nombre de usuario de GitHub
- Nombre del repositorio (default: `eventsync`)
- Si quieres que sea público o privado
- Tu email de GitHub

## 🎯 Opción 2: Configuración Manual

### 1. Crear el repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Completa la información:
   - **Repository name**: `eventsync` (o el nombre que prefieras)
   - **Description**: `AI-powered event extraction from Instagram`
   - **Visibility**: Público o Privado
   - **NO** marques "Add a README file"
   - **NO** marques "Add .gitignore"
   - **NO** marques "Choose a license"
3. Haz clic en "Create repository"

### 2. Conectar tu repositorio local con GitHub

```bash
# Añadir el remote origin
git remote add origin https://github.com/TU_USUARIO/eventsync.git

# Cambiar la rama principal a 'main'
git branch -M main

# Subir el código
git push -u origin main
```

### 3. Actualizar URLs en la documentación

```bash
# Reemplazar 'tu-usuario' con tu nombre de usuario real
sed -i '' 's/tu-usuario/TU_USUARIO/g' README.md
sed -i '' 's/tu-usuario/TU_USUARIO/g' CONTRIBUTING.md
sed -i '' 's/tu-usuario/TU_USUARIO/g' CHANGELOG.md

# Commit y push de los cambios
git add README.md CONTRIBUTING.md CHANGELOG.md
git commit -m "🔗 docs: actualizar URLs con el repositorio correcto"
git push
```

## 🎨 Personalización del Repositorio

### 1. Añadir descripción y topics

Ve a tu repositorio en GitHub y añade:

**Descripción:**
```
AI-powered event extraction from Instagram. Convierte posts, stories y reels de Instagram en eventos estructurados listos para exportar a calendarios.
```

**Topics (etiquetas):**
```
instagram
event-extraction
ai
calendar
react
typescript
nodejs
express
api
web-app
```

### 2. Configurar el README

El README ya está configurado con:
- ✅ Badges de tecnologías
- ✅ Descripción clara del proyecto
- ✅ Instrucciones de instalación
- ✅ Ejemplos de uso
- ✅ Documentación de la API
- ✅ Guía de contribución

### 3. Configurar Issues y Pull Requests

Los templates ya están configurados:
- ✅ Bug Report template
- ✅ Feature Request template
- ✅ Pull Request template

## 🔧 Configuración Adicional

### 1. Configurar GitHub Pages (Opcional)

Si quieres tener una demo en vivo:

1. Ve a Settings > Pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/docs` (crear esta carpeta)
5. Save

### 2. Configurar GitHub Actions (Futuro)

Para CI/CD automático, puedes añadir workflows para:
- Tests automáticos
- Build y deploy
- Linting y formateo
- Security scanning

### 3. Configurar Dependabot (Recomendado)

Para mantener las dependencias actualizadas:

1. Ve a Settings > Security & analysis
2. Enable "Dependency graph"
3. Enable "Dependabot alerts"
4. Enable "Dependabot security updates"

## 📊 Métricas y Analytics

### 1. GitHub Insights

Tu repositorio mostrará automáticamente:
- 📈 Traffic (visitas)
- 👥 Contributors
- 🍴 Forks
- ⭐ Stars

### 2. Configurar Analytics (Opcional)

Puedes añadir:
- Google Analytics
- Hotjar para heatmaps
- Sentry para error tracking

## 🚀 Próximos Pasos

### 1. Verificar que todo funciona

```bash
# Clonar el repositorio en una nueva ubicación para probar
git clone https://github.com/TU_USUARIO/eventsync.git eventsync-test
cd eventsync-test
npm install
npm run dev
```

### 2. Crear el primer release

1. Ve a Releases en GitHub
2. "Create a new release"
3. Tag: `v1.0.0`
4. Title: `🎉 EventSync v1.0.0 - Initial Release`
5. Description: Usa el contenido del CHANGELOG.md

### 3. Compartir el proyecto

- 📱 Redes sociales
- 💼 LinkedIn
- 🐦 Twitter/X
- 📧 Email a colegas
- 💬 Comunidades de desarrolladores

## 🔗 Enlaces Útiles

### Tu Repositorio
- 📖 **Repositorio**: https://github.com/TU_USUARIO/eventsync
- 🐛 **Issues**: https://github.com/TU_USUARIO/eventsync/issues
- 📋 **Pull Requests**: https://github.com/TU_USUARIO/eventsync/pulls
- 📊 **Insights**: https://github.com/TU_USUARIO/eventsync/pulse

### Documentación
- 📖 **README**: [README.md](./README.md)
- 🤝 **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 📋 **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 🎉 ¡Listo!

Tu proyecto EventSync está ahora:
- ✅ En GitHub
- ✅ Con documentación completa
- ✅ Con templates para issues y PRs
- ✅ Listo para colaboración
- ✅ Profesional y bien estructurado

**¡Felicidades! 🎉 Tu proyecto está listo para el mundo.**

---

**¿Necesitas ayuda?** Revisa la [documentación completa](./README.md) o [crea un issue](https://github.com/TU_USUARIO/eventsync/issues) si tienes problemas. 
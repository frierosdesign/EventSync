# 🚀 EventSync - Guía de Inicio Rápido

## ✅ Estado: CONFIGURADO Y FUNCIONANDO

### 🎯 Para empezar inmediatamente:

```bash
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3001 
- **Frontend**: http://localhost:3000

## 📋 Comandos de Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | 🚀 Iniciar frontend + backend |
| `npm run dev:frontend` | 🎨 Solo frontend |
| `npm run dev:backend` | ⚙️ Solo backend |
| `npm run test:api` | 🧪 Probar API |
| `npm run build` | 🏗️ Build producción |
| `npm run clean` | 🧹 Limpiar builds |

## 🔧 Configuración Completa

### ✅ Ya configurado:

- **Vite** con proxy al backend
- **Nodemon** con hot-reload 
- **CORS** configurado
- **Logging** con emojis y colores
- **Variables de entorno**
- **TypeScript** compilando sin errores
- **Playwright** instalado
- **Rate limiting** en scraping

### 🌐 URLs de desarrollo:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Eventos API**: http://localhost:3001/api/events

## 🕷️ Web Scraping

El sistema incluye scraping avanzado de Instagram con:

- ✅ Rate limiting (2 segundos entre requests)
- ✅ User agent real
- ✅ Manejo de errores robusto
- ✅ Fallback automático
- ✅ Logging detallado

## 📁 Estructura de Archivos

```
EventSync-mvp/
├── 🎨 frontend/          # React + TypeScript + Tailwind
├── ⚙️ backend/           # Express + TypeScript + Playwright  
├── 📦 shared/            # Tipos compartidos
├── 📄 package.json       # Scripts principales
├── 🔧 dev-setup.sh       # Setup automático
└── 📋 START.md           # Esta guía
```

## 🧪 Probar el Sistema

### 1. Test rápido de API:
```bash
npm run test:api
```

### 2. Test manual en navegador:
1. Ve a http://localhost:3000
2. Pega cualquier URL de Instagram
3. El sistema extraerá información del evento

### 3. Test directo de API:
```bash
curl -X POST http://localhost:3001/api/events/extract \
  -H "Content-Type: application/json" \
  -d '{"instagramUrl": "https://www.instagram.com/p/ejemplo/"}'
```

## 🔥 Hot Reload Configurado

- **Frontend**: Cambios instantáneos con Vite
- **Backend**: Reinicio automático con nodemon  
- **TypeScript**: Compilación en tiempo real
- **Logs**: Feedback inmediato con emojis

## ⚠️ Troubleshooting

### Puerto ocupado:
```bash
pkill -f "npm run dev"
npm run dev
```

### Limpiar todo:
```bash
npm run clean
npm run dev
```

### Reinstalar dependencias:
```bash
npm run reset
```

## 🎉 ¡Listo para desarrollar!

El entorno está completamente configurado. Solo ejecuta:

```bash
npm run dev
```

Y comienza a codear! 🚀 
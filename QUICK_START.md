# 🚀 EventSync - Quick Start Guide

## ✅ Aplicación Funcionando Correctamente

La aplicación EventSync está ahora **completamente funcional** con frontend-backend conectados.

## 📍 **Ubicación Correcta**

**IMPORTANTE**: Siempre ejecutar desde el directorio raíz del proyecto:

```bash
cd /Users/anabelfrieros/Documents/Product/Cursor/EventSync-mvp
```

## 🎯 **Forma Correcta de Ejecutar**

### Opción 1: Backend y Frontend por Separado (RECOMENDADO)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Opción 2: Ambos Servicios Juntos

```bash
# Desde la raíz del proyecto
npm run dev
```

## 🔍 **Verificación de Estado**

### Backend (Puerto 3001)
```bash
curl http://localhost:3001/health
# Respuesta esperada: {"status":"OK","service":"EventSync API"}

curl http://localhost:3001/api/events
# Respuesta esperada: Lista de eventos con "success": true
```

### Frontend (Puerto 3000)
```bash
curl http://localhost:3000
# Respuesta esperada: HTML de React App
```

## 🎉 **Funcionalidades Disponibles**

### ✅ **Lo Que Funciona:**
- ✅ Backend API funcionando (puerto 3001)
- ✅ Frontend React funcionando (puerto 3000)
- ✅ Conexión frontend-backend establecida
- ✅ Base de datos SQLite con eventos de ejemplo
- ✅ Endpoint `/api/events` devuelve datos correctamente
- ✅ Validación de URLs de Instagram mejorada
- ✅ Health check endpoint funcionando
- ✅ 4 eventos de prueba cargados en BD

### 🔄 **En Desarrollo:**
- ⚠️ Extracción AI (simulada, ocasionalmente falla)
- ⚠️ Datos mock realistas (se están generando)

## 🌐 **Acceso a la Aplicación**

1. **Abrir navegador en**: http://localhost:3000
2. **Ver la interfaz de EventSync**
3. **Ingresar URL de Instagram** en el formulario
4. **Hacer clic en "Extraer Evento"**
5. **Ver resultados** (o errores esperados del simulador)

## 📊 **Estado Actual**

```
✅ Backend: http://localhost:3001 (FUNCIONANDO)
✅ Frontend: http://localhost:3000 (FUNCIONANDO)
✅ Base de Datos: SQLite con 4 eventos
✅ API Endpoints: Todos respondiendo correctamente
✅ Validación: URLs de Instagram aceptadas
```

## 🐛 **Troubleshooting**

### Si aparece "Port already in use":
```bash
# Limpiar procesos
pkill -f "npm run dev"
pkill -f "ts-node"
pkill -f "vite"

# O específicamente por puerto
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Si no se conecta el frontend con backend:
1. Verificar que backend esté en puerto 3001
2. Verificar que frontend esté en puerto 3000
3. Comprobar variable `VITE_API_URL` en frontend

### Si hay errores de base de datos:
1. El archivo `eventsync.db` se crea automáticamente
2. Los datos de ejemplo se cargan al iniciar
3. Usar SQLite (no PostgreSQL en desarrollo)

## 🎯 **Próximo Paso**

**La aplicación está lista para usar**. Puedes:

1. Abrir http://localhost:3000 en tu navegador
2. Probar la interfaz de usuario
3. Ingresar URLs de Instagram para extracción
4. Ver la lista de eventos guardados
5. Explorar las diferentes funcionalidades

¡**EventSync está funcionando correctamente**! 🚀 
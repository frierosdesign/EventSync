# 🎉 EventSync - AI-Powered Event Extraction from Instagram

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

**EventSync** es una aplicación web que extrae automáticamente información de eventos desde URLs de Instagram utilizando inteligencia artificial simulada. Convierte posts, stories y reels de Instagram en eventos estructurados listos para exportar a calendarios.

## ✨ Características

- 🤖 **Extracción AI Simulada**: Procesa contenido de Instagram con IA para identificar eventos
- 📅 **Exportación a Calendarios**: Integración directa con Google Calendar
- 🎨 **Interfaz Moderna**: UI/UX intuitiva y responsive con React + TypeScript
- 🔄 **Tiempo Real**: Extracción y preview en tiempo real
- 📊 **Múltiples Formatos**: Soporta posts, stories, reels e IGTV
- 🎯 **Alta Precisión**: Sistema de confianza y validación de datos
- 💾 **Persistencia**: Base de datos SQLite para historial de eventos

## 🚀 Demo

**Frontend**: http://localhost:3003  
**Backend API**: http://localhost:3001  
**Health Check**: http://localhost:3001/health

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Framer Motion** - Animaciones
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **SQLite** - Base de datos
- **Nodemon** - Hot reloading
- **Helmet** - Seguridad
- **CORS** - Cross-origin requests

### Herramientas
- **Git** - Control de versiones
- **npm** - Gestión de dependencias
- **ESLint** - Linting
- **Prettier** - Formateo de código

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/eventsync.git
cd eventsync
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install

# Volver al directorio raíz
cd ..
```

### 3. Configurar variables de entorno
```bash
# Crear archivo .env en el backend
cp backend/.env.example backend/.env

# Editar las variables según necesites
nano backend/.env
```

### 4. Ejecutar el proyecto
```bash
# Opción 1: Ejecutar todo con el script principal
npm run dev

# Opción 2: Ejecutar por separado
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 🎯 Uso

### 1. Acceder a la aplicación
Abre tu navegador y ve a `http://localhost:3003`

### 2. Extraer un evento
1. Pega una URL de Instagram (post, story, reel)
2. Haz clic en "Extraer Evento"
3. Espera a que la IA procese el contenido
4. Revisa el preview del evento extraído

### 3. Exportar a calendario
1. En el preview del evento, haz clic en "Exportar a Calendario"
2. Se abrirá Google Calendar con los datos del evento
3. Confirma y guarda el evento

### 4. Ver historial
- Los eventos extraídos se guardan automáticamente
- Puedes ver el historial en la sección de eventos

## 🔧 API Endpoints

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Obtener evento específico
- `POST /api/events/extract` - Extraer evento de URL
- `DELETE /api/events/:id` - Eliminar evento

### Utilidades
- `GET /health` - Health check
- `POST /api/events/test-extraction` - Test de extracción

### Ejemplo de uso
```bash
# Extraer evento
curl -X POST http://localhost:3001/api/events/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/p/ejemplo/"}'

# Listar eventos
curl http://localhost:3001/api/events
```

## 🏗️ Estructura del Proyecto

```
eventsync/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── app.ts          # Punto de entrada
│   │   ├── config/         # Configuración
│   │   ├── middleware/     # Middlewares
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Lógica de negocio
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades
│   │   ├── pages/          # Páginas
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   └── vite.config.ts
├── shared/                 # Código compartido
│   ├── src/
│   │   ├── types/          # Tipos compartidos
│   │   └── utils/          # Utilidades compartidas
│   └── package.json
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Ejecutar tests del backend
cd backend && npm test

# Ejecutar tests del frontend
cd frontend && npm test

# Ejecutar tests de integración
npm run test:integration
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
# Build del frontend
cd frontend && npm run build

# Iniciar servidor de producción
cd backend && npm start
```

### Docker (Opcional)
```bash
# Construir imagen
docker build -t eventsync .

# Ejecutar contenedor
docker run -p 3001:3001 -p 3003:3003 eventsync
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Biblioteca de UI
- [Express.js](https://expressjs.com/) - Framework web
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Superset de JavaScript

## 📞 Soporte

Si tienes alguna pregunta o problema:

- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/eventsync/issues)
- 💬 Discord: [Servidor de la comunidad](https://discord.gg/eventsync)

---

⭐ **¡No olvides darle una estrella al proyecto si te gusta!** 
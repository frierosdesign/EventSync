# 📋 Changelog - EventSync

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Soporte para extracción de eventos desde Instagram Stories
- Sistema de validación de URLs mejorado
- Componente de preview de eventos con manejo de múltiples formatos de fecha
- Integración con Google Calendar para exportación de eventos
- Sistema de logging detallado para debugging
- Health check endpoint para monitoreo
- **Icono de enlace externo para abrir eventos de Instagram en nueva pestaña**
- Enlaces directos al post original de Instagram en EventPreview

### Changed
- Mejorado el manejo de errores en el componente EventPreview
- Optimizada la estructura de datos para compatibilidad entre frontend y backend
- Actualizada la configuración de CORS para múltiples puertos de desarrollo

### Fixed
- Error de "Cannot read properties of undefined (reading 'startDate')" en EventPreview
- Problemas de compatibilidad de tipos entre frontend y backend
- Errores de CORS al conectar frontend con backend
- Fallos en la extracción de eventos cuando faltan datos de fecha

## [1.0.0] - 2025-07-25

### Added
- 🎉 **Lanzamiento inicial de EventSync**
- **Frontend React + TypeScript** con interfaz moderna
- **Backend Express + TypeScript** con API REST completa
- **Extracción AI simulada** de eventos desde Instagram
- **Soporte para múltiples tipos de contenido**: Posts, Reels, IGTV, Stories
- **Sistema de validación robusto** con niveles de confianza
- **Base de datos SQLite** con persistencia de eventos
- **Exportación a Google Calendar** integrada
- **UI/UX moderna** con Tailwind CSS y Framer Motion
- **Sistema de tipos compartidos** entre frontend y backend
- **Middleware completo**: Logging, validación, manejo de errores, CORS
- **Documentación completa** con README y guías de contribución

### Features Principales
- ✅ Extracción automática de eventos desde URLs de Instagram
- ✅ Preview en tiempo real de eventos extraídos
- ✅ Validación inteligente de datos con niveles de confianza
- ✅ Exportación directa a Google Calendar
- ✅ Historial de eventos extraídos
- ✅ Interfaz responsive y moderna
- ✅ API REST completa con documentación
- ✅ Sistema de logging detallado
- ✅ Manejo robusto de errores
- ✅ Configuración flexible para desarrollo y producción

### Tecnologías Implementadas
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, TypeScript, SQLite
- **Herramientas**: Git, npm, ESLint, Prettier
- **Arquitectura**: Monorepo con código compartido

---

## 📝 Notas de Versión

### Convenciones de Versionado
- **MAJOR.MINOR.PATCH** (ej: 1.0.0)
- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

### Tipos de Cambios
- **Added**: Nuevas funcionalidades
- **Changed**: Cambios en funcionalidades existentes
- **Deprecated**: Funcionalidades que serán removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correcciones de bugs
- **Security**: Mejoras de seguridad

---

## 🔗 Enlaces Útiles

- 📖 [Documentación Completa](./README.md)
- 🤝 [Guía de Contribución](./CONTRIBUTING.md)
- 🐛 [Reportar Bugs](https://github.com/frierosdesign/EventSync/issues)
- 💡 [Solicitar Features](https://github.com/frierosdesign/EventSync/issues)

---

**¡Gracias por usar EventSync! 🎉** 
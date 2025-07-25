# 🤝 Guía de Contribución - EventSync

¡Gracias por tu interés en contribuir a EventSync! Este documento te ayudará a comenzar.

## 📋 Tabla de Contenidos

- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Convenciones de Código](#convenciones-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

- 🐛 **Reportar Bugs**: Ayúdanos a encontrar y arreglar problemas
- 💡 **Solicitar Features**: Sugiere nuevas funcionalidades
- 🔧 **Mejorar Código**: Optimiza código existente
- 📚 **Documentación**: Mejora la documentación
- 🧪 **Tests**: Añade o mejora tests
- 🌐 **Traducciones**: Ayuda con internacionalización

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Git

### Pasos de Configuración

1. **Fork el repositorio**
   ```bash
   # Ve a GitHub y haz fork del repositorio
   # Luego clona tu fork
   git clone https://github.com/frierosdesign/EventSync.git
   cd eventsync
   ```

2. **Configurar el upstream**
   ```bash
   git remote add upstream https://github.com/frierosdesign/EventSync.git
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

4. **Configurar variables de entorno**
   ```bash
   cp backend/env.example backend/.env
   # Edita backend/.env con tus configuraciones
   ```

5. **Verificar instalación**
   ```bash
   npm run dev
   # Debería abrir http://localhost:3003
   ```

## 🏗️ Estructura del Proyecto

```
eventsync/
├── backend/                 # API Express + TypeScript
│   ├── src/
│   │   ├── app.ts          # Punto de entrada
│   │   ├── config/         # Configuración
│   │   ├── middleware/     # Middlewares
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Lógica de negocio
│   │   └── types/          # Tipos TypeScript
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades
│   │   ├── pages/          # Páginas
│   │   └── types/          # Tipos TypeScript
│   └── package.json
├── shared/                 # Código compartido
│   ├── src/
│   │   ├── types/          # Tipos compartidos
│   │   └── utils/          # Utilidades compartidas
│   └── package.json
└── README.md
```

## 📝 Convenciones de Código

### TypeScript

- Usa tipos estrictos
- Evita `any` cuando sea posible
- Documenta interfaces complejas
- Usa enums para valores constantes

```typescript
// ✅ Bueno
interface EventData {
  id: string;
  title: string;
  date: string;
  confidence: number;
}

// ❌ Evitar
const event: any = { /* ... */ };
```

### React

- Usa componentes funcionales con hooks
- Nombra componentes en PascalCase
- Usa TypeScript para props
- Mantén componentes pequeños y enfocados

```typescript
// ✅ Bueno
interface EventPreviewProps {
  event: EventData;
  onSave?: (event: EventData) => void;
}

export const EventPreview: React.FC<EventPreviewProps> = ({ event, onSave }) => {
  // ...
};
```

### Naming Conventions

- **Archivos**: kebab-case (`event-preview.tsx`)
- **Componentes**: PascalCase (`EventPreview`)
- **Funciones**: camelCase (`extractEvent`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Tipos/Interfaces**: PascalCase (`EventData`)

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# ✅ Ejemplos de commits
feat: add event extraction from Instagram URLs
fix: resolve date parsing issue in EventPreview
docs: update API documentation
test: add unit tests for EventService
refactor: simplify event validation logic
style: format code with prettier
```

## 🔄 Proceso de Pull Request

### 1. Crear una rama

```bash
# Actualizar tu fork
git fetch upstream
git checkout main
git merge upstream/main

# Crear rama para tu feature
git checkout -b feature/nombre-de-tu-feature
```

### 2. Desarrollar tu feature

- Escribe código limpio y bien documentado
- Añade tests cuando sea apropiado
- Actualiza documentación si es necesario
- Sigue las convenciones de código

### 3. Commit y Push

```bash
# Añadir cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: add Instagram story support"

# Push a tu fork
git push origin feature/nombre-de-tu-feature
```

### 4. Crear Pull Request

1. Ve a tu fork en GitHub
2. Haz clic en "New Pull Request"
3. Selecciona tu rama
4. Completa la plantilla de PR
5. Revisa los checks automáticos

### Plantilla de Pull Request

```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Tests
- [ ] Tests unitarios añadidos/pasando
- [ ] Tests de integración añadidos/pasando
- [ ] Manual testing realizado

## 📸 Screenshots (si aplica)
Añade screenshots si hay cambios en la UI.

## ✅ Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] Documentación actualizada
- [ ] Tests añadidos/pasando
- [ ] No hay errores de linting
- [ ] Build exitoso
```

## 🐛 Reportar Bugs

### Antes de reportar

1. Verifica que el bug no haya sido reportado ya
2. Asegúrate de que estás usando la última versión
3. Intenta reproducir el bug en un entorno limpio

### Plantilla de Bug Report

```markdown
## 🐛 Descripción del Bug
Descripción clara y concisa del problema.

## 🔄 Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Scroll down to '...'
4. Ver error

## ✅ Comportamiento Esperado
Descripción de lo que debería pasar.

## 📱 Información del Sistema
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. 18.17.0]
- EventSync Version: [e.g. 1.0.0]

## 📸 Screenshots
Añade screenshots si es relevante.

## 📋 Logs
Añade logs relevantes del navegador o consola.
```

## 💡 Solicitar Features

### Plantilla de Feature Request

```markdown
## 💡 Descripción de la Feature
Descripción clara de la funcionalidad que te gustaría ver.

## 🎯 Caso de Uso
Explica por qué esta feature sería útil.

## 💭 Solución Propuesta
Describe cómo te imaginas que funcionaría.

## 🔄 Alternativas Consideradas
Describe otras soluciones que has considerado.

## 📋 Información Adicional
Cualquier contexto adicional, screenshots, etc.
```

## 🏷️ Labels y Milestones

### Labels Comunes

- `bug` - Problemas que necesitan ser arreglados
- `enhancement` - Mejoras a funcionalidades existentes
- `feature` - Nuevas funcionalidades
- `documentation` - Mejoras a la documentación
- `good first issue` - Bueno para nuevos contribuidores
- `help wanted` - Necesita ayuda de la comunidad
- `priority: high` - Alta prioridad
- `priority: low` - Baja prioridad

## 🎉 Reconocimiento

Todas las contribuciones son valiosas y serán reconocidas:

- Tu nombre aparecerá en la lista de contribuidores
- Serás mencionado en el changelog
- Recibirás crédito en releases

## 📞 Contacto

Si tienes preguntas sobre cómo contribuir:

- 📧 Email: anabel@frierosdesign.com
- 💬 Discord: [Servidor de la comunidad](https://discord.gg/eventsync)
- 🐛 Issues: [GitHub Issues](https://github.com/frierosdesign/EventSync/issues)

---

**¡Gracias por contribuir a EventSync! 🎉** 
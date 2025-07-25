# Componentes UI de EventSync

Esta documentación describe todos los componentes UI y hooks personalizados disponibles en EventSync.

## 🎨 Componentes UI

### URLInput

Componente para introducir y validar URLs de Instagram con diseño moderno.

```tsx
import { URLInput } from './components/ui';

<URLInput
  value={url}
  onChange={setUrl}
  onSubmit={handleSubmit}
  isLoading={false}
  placeholder="https://www.instagram.com/p/..."
  disabled={false}
  className=""
/>
```

**Props:**
- `value`: URL actual
- `onChange`: Función para actualizar la URL
- `onSubmit`: Función ejecutada al enviar el formulario
- `isLoading`: Estado de carga (opcional)
- `placeholder`: Texto placeholder (opcional)
- `disabled`: Deshabilitar input (opcional)
- `className`: Clases CSS adicionales (opcional)

**Características:**
- ✅ Validación automática de URLs de Instagram
- ✅ Estados visuales (válido/inválido/cargando)
- ✅ Soporte para posts (/p/) y reels (/reel/)
- ✅ Diseño responsivo con gradientes

### LoadingSpinner

Conjunto de componentes para mostrar estados de carga.

```tsx
import { 
  LoadingSpinner, 
  LoadingPage, 
  LoadingButton, 
  LoadingCard, 
  LoadingOverlay 
} from './components/ui';

// Spinner básico
<LoadingSpinner 
  size="md" 
  message="Cargando..." 
  variant="primary"
  centered={false}
/>

// Variantes pre-configuradas
<LoadingPage message="Cargando página..." />
<LoadingButton message="Procesando..." />
<LoadingCard message="Cargando datos..." />
<LoadingOverlay message="Procesando..." show={true} />
```

**Props del LoadingSpinner:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `message`: Mensaje a mostrar (opcional)
- `centered`: Centrar verticalmente (opcional)
- `variant`: 'primary' | 'secondary' | 'white'
- `className`: Clases CSS adicionales (opcional)

**Variantes disponibles:**
- `LoadingPage`: Para páginas completas
- `LoadingButton`: Para botones (tamaño pequeño)
- `LoadingCard`: Dentro de tarjetas
- `LoadingOverlay`: Modal overlay

### ErrorMessage

Componente versátil para mostrar diferentes tipos de errores.

```tsx
import { 
  ErrorMessage, 
  ErrorPage, 
  ErrorAlert, 
  ErrorCard 
} from './components/ui';

// Error básico
<ErrorMessage
  title="Error de conexión"
  message="No se pudo conectar con el servidor"
  variant="error"
  size="md"
  dismissible={true}
  onDismiss={() => {}}
  onRetry={() => {}}
  onGoHome={() => {}}
  onGoBack={() => {}}
/>

// Variantes pre-configuradas
<ErrorPage 
  title="¡Oops! Algo salió mal"
  message="Ha ocurrido un error inesperado"
  onRetry={() => {}}
  onGoHome={() => {}}
/>
<ErrorAlert message="Error simple" onDismiss={() => {}} />
<ErrorCard title="Error" message="Descripción del error" />
```

**Props:**
- `title`: Título del error (opcional)
- `message`: Mensaje principal (requerido)
- `variant`: 'error' | 'warning' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `dismissible`: Mostrar botón cerrar (opcional)
- `onDismiss`: Función para cerrar (opcional)
- `onRetry`: Función para reintentar (opcional)
- `onGoHome`: Función para ir al inicio (opcional)
- `onGoBack`: Función para volver (opcional)
- `centered`: Centrar contenido (opcional)

### EventPreview

Componente principal para mostrar información extraída de eventos de Instagram.

```tsx
import { EventPreview } from './components/ui';

<EventPreview
  event={eventData}
  isEditing={false}
  onEdit={() => setIsEditing(true)}
  onSave={(event) => saveEvent(event)}
  onCancel={() => setIsEditing(false)}
  onSaveToCalendar={(event) => saveToCalendar(event)}
  className=""
/>
```

**Props:**
- `event`: Datos del evento (requerido)
- `isEditing`: Modo edición (opcional)
- `onEdit`: Función para activar edición (opcional)
- `onSave`: Función para guardar cambios (opcional)
- `onCancel`: Función para cancelar edición (opcional)
- `onSaveToCalendar`: Función para guardar en calendario (opcional)
- `className`: Clases CSS adicionales (opcional)

**Estructura del evento:**
```tsx
interface EventData {
  id?: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  location?: string;
  imageUrl?: string;
  instagramUrl: string;
  confidence?: number; // 0-1
}
```

**Características:**
- ✅ Modo vista y edición
- ✅ Mostrar imagen de Instagram
- ✅ Indicador de confianza de extracción
- ✅ Enlace directo al post de Instagram
- ✅ Edición inline de todos los campos
- ✅ Acciones personalizables

## 🔧 Hooks Personalizados

### useEventExtraction

Hook para manejar la extracción de eventos desde URLs de Instagram.

```tsx
import { useEventExtraction } from './hooks';

const { state, extractEvent, clearState, clearError } = useEventExtraction();

// Usar el hook
const handleSubmit = async (url: string) => {
  await extractEvent(url);
};

// Estado disponible
const {
  isLoading,   // boolean
  error,       // string | null
  event,       // EventData | null
  isSuccess    // boolean
} = state;
```

**Métodos:**
- `extractEvent(url)`: Extrae evento de una URL
- `clearState()`: Limpia todo el estado
- `clearError()`: Limpia solo el error

**Estado retornado:**
- `isLoading`: Indica si está procesando
- `error`: Mensaje de error si falla
- `event`: Datos del evento extraído
- `isSuccess`: Indica si la extracción fue exitosa

### useLocalStorage

Hook para manejar localStorage con tipado TypeScript.

```tsx
import { useLocalStorage } from './hooks';

const [value, setValue, removeValue] = useLocalStorage('key', initialValue);

// Uso
setValue(newValue);
setValue(prev => ({ ...prev, newField: 'value' })); // Con función
removeValue(); // Limpia el valor
```

**Características:**
- ✅ Tipado TypeScript completo
- ✅ Sincronización entre pestañas
- ✅ Manejo de errores automático
- ✅ API similar a useState

### useFormValidation

Hook avanzado para validación de formularios.

```tsx
import { useFormValidation, validators } from './hooks';

const {
  state,
  setValue,
  setFieldTouched,
  validateForm,
  handleSubmit,
  reset
} = useFormValidation(initialValues, validationConfig);

// Configuración de validación
const config = {
  email: {
    required: true,
    rules: [validators.email]
  },
  url: {
    required: true,
    rules: [validators.instagramUrl]
  }
};
```

**Validadores incluidos:**
- `validators.email`: Validación de email
- `validators.url`: Validación de URL
- `validators.instagramUrl`: URLs específicas de Instagram
- `validators.minLength(n)`: Longitud mínima
- `validators.maxLength(n)`: Longitud máxima
- `validators.pattern(regex, message)`: Patrón personalizado

## 🎯 Patrones de Uso

### 1. Página de Extracción Completa

```tsx
import { URLInput, EventPreview, ErrorMessage } from './components/ui';
import { useEventExtraction } from './hooks';

export const ExtractionPage = () => {
  const [url, setUrl] = useState('');
  const { state, extractEvent, clearState, clearError } = useEventExtraction();

  return (
    <div className="space-y-8">
      <URLInput
        value={url}
        onChange={setUrl}
        onSubmit={extractEvent}
        isLoading={state.isLoading}
      />
      
      {state.error && (
        <ErrorMessage
          message={state.error}
          onRetry={() => extractEvent(url)}
          onDismiss={clearError}
          dismissible
        />
      )}
      
      {state.event && (
        <EventPreview
          event={state.event}
          onSaveToCalendar={saveToCalendar}
        />
      )}
    </div>
  );
};
```

### 2. Formulario con Validación

```tsx
import { useFormValidation, validators } from './hooks';
import { ErrorMessage } from './components/ui';

const formConfig = {
  instagram_url: {
    required: true,
    requiredMessage: 'La URL es requerida',
    rules: [validators.instagramUrl]
  }
};

export const URLForm = () => {
  const { state, setValue, handleSubmit } = useFormValidation(
    { instagram_url: '' },
    formConfig
  );

  const onSubmit = async (values) => {
    // Procesar formulario
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        value={state.values.instagram_url}
        onChange={(e) => setValue('instagram_url', e.target.value)}
      />
      
      {state.errors.instagram_url && state.touched.instagram_url && (
        <ErrorMessage
          message={state.errors.instagram_url}
          size="sm"
        />
      )}
      
      <button type="submit" disabled={!state.isValid}>
        Enviar
      </button>
    </form>
  );
};
```

### 3. Estados de Carga Globales

```tsx
import { LoadingOverlay } from './components/ui';
import { useState } from 'react';

export const App = () => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  return (
    <>
      <LoadingOverlay 
        show={isGlobalLoading}
        message="Procesando solicitud..."
      />
      {/* Resto de la aplicación */}
    </>
  );
};
```

## 🎨 Personalización

### Tailwind CSS Classes

Todos los componentes usan las siguientes clases CSS personalizadas definidas en `styles/index.css`:

```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500;
}
```

### Colores Primary

Los componentes usan la paleta `primary` que debe estar definida en tu configuración de Tailwind:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          // ... más tonos
        }
      }
    }
  }
}
```

## 📱 Responsive Design

Todos los componentes están diseñados con un enfoque mobile-first:

- **Mobile (0-640px)**: Layout vertical, botones grandes, navegación simplificada
- **Tablet (640-1024px)**: Layout híbrido, mejor uso del espacio
- **Desktop (1024px+)**: Layout horizontal, hover effects, información expandida

## ♿ Accesibilidad

Los componentes incluyen características de accesibilidad:

- ✅ Aria labels apropiados
- ✅ Navegación por teclado
- ✅ Colores con contraste adecuado
- ✅ Estados de focus visibles
- ✅ Texto alternativo para imágenes

## 🚀 Optimización

### Performance

- Componentes optimizados con React.memo donde necesario
- Lazy loading de imágenes en EventPreview
- Debouncing en validaciones de formulario
- Estados locales eficientes

### Bundle Size

- Tree-shaking habilitado para imports selectivos
- Iconos importados individualmente desde lucide-react
- Código dividido por rutas automáticamente con Vite

¡Todos los componentes están listos para usar con datos mock y pueden ser conectados al backend cuando esté disponible! 
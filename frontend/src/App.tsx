import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MainInterface } from './pages/MainInterface';
import { EventsPage } from './pages/EventsPage';
import { ComponentsDemo } from './pages/ComponentsDemo';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary, DevErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      title="Error en la aplicación"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
        // Aquí se podría enviar a un servicio de logging
      }}
    >
      <AppProvider>
        <DevErrorBoundary>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<MainInterface />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/demo" element={<ComponentsDemo />} />
              </Routes>
            </Layout>
          </Router>
        </DevErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Instagram, Palette } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                aria-label="EventSync - Ir al inicio"
              >
                <Instagram className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">EventSync</span>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1" role="navigation" aria-label="Navegación principal">
              <Link
                to="/"
                className={`
                  flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium 
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive('/')
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                <span>Inicio</span>
              </Link>
              
              <Link
                to="/events"
                className={`
                  flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium 
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive('/events')
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
                aria-current={isActive('/events') ? 'page' : undefined}
              >
                <Calendar className="h-4 w-4" />
                <span>Eventos</span>
              </Link>
              
              <Link
                to="/demo"
                className={`
                  flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium 
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive('/demo')
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
                aria-current={isActive('/demo') ? 'page' : undefined}
              >
                <Palette className="h-4 w-4" />
                <span>Demo</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main 
        role="main" 
        className="flex-1"
        aria-label="Contenido principal"
      >
        {children}
      </main>
    </div>
  );
}; 
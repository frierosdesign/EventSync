#!/bin/bash

echo "🚀 Setting up EventSync development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version check passed: $(node -v)"

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install

cd ..

# Install shared dependencies
print_status "Installing shared dependencies..."
cd shared
npm install
cd ..

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Build backend to check for errors
print_status "Building backend to check for TypeScript errors..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    print_error "Backend build failed. Please check TypeScript errors."
    exit 1
fi
cd ..

# Run a quick test
print_status "Running quick API test..."
npm run dev &
DEV_PID=$!

# Wait for servers to start
sleep 10

# Test health endpoint
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Backend health check passed!"
else
    print_warning "Backend might not be fully ready yet"
fi

# Stop development servers
kill $DEV_PID 2>/dev/null || true

print_status "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:3000 (Frontend)"
echo "  3. API: http://localhost:3001 (Backend)"
echo "  4. Test API: npm run test:api"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev              - Start both frontend and backend"
echo "  npm run dev:frontend     - Start only frontend"
echo "  npm run dev:backend      - Start only backend"
echo "  npm run test:api         - Test API functionality"
echo "  npm run build            - Build for production"
echo "  npm run clean            - Clean build artifacts"
echo ""
print_status "Happy coding! 🚀" 
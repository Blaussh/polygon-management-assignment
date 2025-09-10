#!/bin/bash

# Docker Setup Script for Polygon Management Application
set -e

echo "🐳 Setting up Docker environment for Polygon Management App"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

print_status "Docker and Docker Compose are available ✓"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created. Please review and adjust the values as needed."
else
    print_warning ".env file already exists. Please ensure it has the correct values."
fi

# Function to build and run production environment
setup_production() {
    print_status "Setting up production environment..."
    
    # Build and start services
    docker-compose down --remove-orphans
    docker-compose build --no-cache
    docker-compose up -d
    
    print_success "Production environment is starting up!"
    print_status "Services will be available at:"
    echo "  🌐 Frontend: http://localhost"
    echo "  🔧 Backend API: http://localhost:3001"
    echo "  ❤️ Health Check: http://localhost:3001/health"
}

# Function to build and run development environment
setup_development() {
    print_status "Setting up development environment..."
    
    # Build and start services
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Development environment is starting up!"
    print_status "Services will be available at:"
    echo "  🌐 Frontend: http://localhost:5173"
    echo "  🔧 Backend API: http://localhost:3001"
    echo "  ❤️ Health Check: http://localhost:3001/health"
}

# Function to show status
show_status() {
    print_status "Docker container status:"
    docker ps --filter "name=polygon" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down --remove-orphans
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    docker system prune -f
    print_success "Cleanup completed!"
}

# Main menu
case "${1:-help}" in
    "prod"|"production")
        setup_production
        ;;
    "dev"|"development")
        setup_development
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        echo "🐳 Docker Setup Script for Polygon Management App"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  prod, production  - Set up production environment"
        echo "  dev, development  - Set up development environment"
        echo "  status           - Show container status"
        echo "  logs [service]   - Show logs (optionally for specific service)"
        echo "  cleanup          - Clean up Docker resources"
        echo "  help             - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 prod          - Start production environment"
        echo "  $0 dev           - Start development environment"
        echo "  $0 logs backend  - Show backend logs"
        echo "  $0 cleanup       - Clean up everything"
        ;;
esac

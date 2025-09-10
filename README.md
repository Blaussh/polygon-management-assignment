# Polygon Management Web Application

A fullstack web application for managing polygons on a canvas, built with Node.js backend and React frontend.

## 🎯 Features

### Core Functionality

- **Interactive Canvas**: Draw polygons by clicking on a canvas with background image
- **Polygon Management**: Create, display, and delete polygons with names
- **Visual Interface**: List view of all polygons with selection and deletion capabilities
- **Persistent Storage**: Polygons saved to SQLite database with Docker volumes, persist after server restarts
- **API Delays**: 5-second delay on all API operations as requested

### Advanced Features

- **Adaptive Text Sizing**: Polygon names automatically resize based on polygon dimensions
- **Smart Text Positioning**: Text positioned outside polygon when too large to fit inside
- **Interactive Feedback**: Hover effects, selection states, and visual indicators
- **Responsive Design**: Works on different screen sizes
- **Error Handling**: Comprehensive error handling and user feedback
- **Keyboard Shortcuts**: ESC key to cancel drawing

## 🚀 Docker Deployment

### Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git** (for cloning the repository)

### Quick Start

```bash
# Clone the repository
git clone [your-repo-url]
cd polygon-management-assignment

# Start the application (production mode)
docker-compose up -d

# Or use the setup script
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh prod
```

The application will be available at:

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Production Deployment

#### Using Docker Compose (Recommended)

```bash
# Build and start production environment
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Using the Setup Script

```bash
# Make script executable
chmod +x scripts/docker-setup.sh

# Start production environment
./scripts/docker-setup.sh prod

# Check status
./scripts/docker-setup.sh status

# View logs
./scripts/docker-setup.sh logs

# Clean up
./scripts/docker-setup.sh cleanup
```

### Development Deployment

For development with hot reloading:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Or using the script
./scripts/docker-setup.sh dev
```

Development URLs:
- **Frontend**: http://localhost:5173 (with hot reload)
- **Backend API**: http://localhost:3001 (with hot reload)

### Docker Services

#### Backend Service
- **Container**: `polygon-backend`
- **Port**: 3001
- **Health Check**: `/health` endpoint
- **Database**: SQLite with persistent volume
- **Restart Policy**: `unless-stopped`

#### Frontend Service
- **Container**: `polygon-frontend`
- **Port**: 80 (production) / 5173 (development)
- **Web Server**: Nginx (production) / Vite dev server (development)
- **Health Check**: HTTP status check
- **Restart Policy**: `unless-stopped`

### Data Persistence

The application uses Docker volumes for data persistence:

- **Production**: `backend_data` volume
- **Development**: `backend_data_dev` volume
- **Location**: `/app/data/database.db` inside container
- **Persistence**: Polygons persist across container restarts and updates
- **Smart Seeding**: Database only seeds with sample data if empty (preserves user data)

#### Database Management

```bash
# View database contents
docker-compose exec backend npx prisma studio

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d

# Backup database
docker cp polygon-backend:/app/data/database.db ./backup.db

# Restore database
docker cp ./backup.db polygon-backend:/app/data/database.db
```

### Environment Variables

#### Production Environment
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=file:/app/data/database.db
CORS_ORIGIN=http://localhost,http://frontend
```

#### Development Environment
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=file:/app/data/database.db
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3001
```

### Health Checks

Both services include comprehensive health checks:

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend health
curl http://localhost/

# View health check status
docker-compose ps
```

### Troubleshooting

#### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3001
   ```

2. **Container won't start**:
   ```bash
   # Check logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. **Database issues**:
   ```bash
   # Reset database volume
   docker-compose down -v
   docker-compose up -d
   ```

4. **Build issues**:
   ```bash
   # Force rebuild
   docker-compose build --no-cache
   docker-compose up -d
   ```

#### Useful Commands

```bash
# View all containers
docker ps -a

# View container logs
docker logs polygon-backend
docker logs polygon-frontend

# Execute commands in container
docker exec -it polygon-backend sh
docker exec -it polygon-frontend sh

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Backend Setup

```bash
cd backend
npm install
npm run build
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

#### Backend Tests

```bash
cd backend

# Install dependencies
npm install

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx jest tests/unit/validation-only.test.ts

# Run integration tests
npx jest tests/integration/
```

#### Frontend Tests

```bash
cd frontend

# Install dependencies
npm install

# Run tests in verbose mode
npx vitest run --reporter=verbose
```

#### Running Tests in Docker

```bash
# Backend tests in Docker
docker-compose exec backend npm test

# Frontend tests in Docker
docker-compose exec frontend npm test

# Or run tests in development containers
docker-compose -f docker-compose.dev.yml exec backend npm test
docker-compose -f docker-compose.dev.yml exec frontend npm test
```

## 📡 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### Get All Polygons

```http
GET /api/polygons
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "P1",
    "points": [
      [12.3, 12.0],
      [16.3, 12.0],
      [16.3, 8.0],
      [12.3, 8.0]
    ]
  }
]
```

#### Create Polygon

```http
POST /api/polygons
Content-Type: application/json

{
  "name": "Polygon Name",
  "points": [[x1, y1], [x2, y2], [x3, y3], ...]
}
```

#### Delete Polygon

```http
DELETE /api/polygons/:id
```

#### Health Check

```http
GET /health
```

## 🎨 Usage Instructions

### Drawing Polygons

1. Click **"Draw New Polygon"** button
2. Click on the canvas to add points (minimum 3 points required)
3. Double-click to finish the polygon
4. Enter a name for your polygon
5. Click **"Save"** to create the polygon

### Managing Polygons

- **Select**: Click on any polygon on the canvas or in the list
- **Delete**: Select a polygon and click **"Delete Selected"**
- **Cancel Drawing**: Press **ESC** key or click **"Cancel Drawing"**

### Keyboard Shortcuts

- **ESC**: Cancel current drawing operation
- **Double-click**: Finish polygon drawing

## 🏗️ Architecture

### Backend (Node.js + TypeScript)

- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Prisma ORM
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston logger
- **Testing**: Jest with Supertest

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Canvas**: HTML5 Canvas API
- **Testing**: Vitest with React Testing Library
- **Notifications**: React Hot Toast

### Database Schema

```sql
model Polygon {
  id        Int      @id @default(autoincrement())
  name      String
  points    Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🐳 Docker Configuration

### Services

- **Backend**: Node.js API server (port 5000)
- **Frontend**: React app served by Nginx (port 3000)
- **Database**: SQLite file volume mounted for persistence

### Volumes

- `polygon_data`: Persistent storage for SQLite database
- Source code mounted for development mode

### Health Checks

Both services include health checks for monitoring:

- Backend: `/health` endpoint
- Frontend: Nginx status check

## 🧪 Testing

### Test Overview

The application includes comprehensive test coverage for both backend and frontend:

#### Backend Tests (Jest + Supertest)
- **Unit Tests**: Validation logic, utility functions
- **Integration Tests**: API endpoints, database operations
- **Test Coverage**: 41/41 tests passing ✅

#### Frontend Tests (Vitest + React Testing Library)
- **Component Tests**: React component rendering and behavior
- **Hook Tests**: Custom React hooks with React Query
- **Service Tests**: API service layer testing
- **Utility Tests**: Polygon calculation and validation utilities
- **Test Coverage**: 24/25 tests passing (1 skipped) ✅

### Test Structure

```
backend/
├── tests/
│   ├── unit/              # Unit tests
│   │   └── validation-only.test.ts
│   ├── integration/       # Integration tests
│   │   ├── healthRoutes.test.ts
│   │   └── polygonRoutes.test.ts
│   ├── setup.ts          # Test setup
│   └── test-env.ts       # Test environment

frontend/
├── src/
│   ├── components/       # Component tests
│   │   └── PolygonList/
│   │       └── PolygonItem.test.tsx
│   ├── hooks/           # Hook tests
│   │   └── usePolygons.test.ts
│   ├── services/        # Service tests
│   │   └── api.test.ts
│   └── utils/           # Utility tests
│       └── polygonUtils.test.ts
└── src/test/
    └── setup.ts         # Test setup
```

### Running All Tests

```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test

# Run tests in both directories
npm run test:all  # (if configured in root package.json)
```

### Test Commands Reference

#### Backend Test Commands
```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npx jest --verbose       # Verbose output
```

#### Frontend Test Commands
```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm run test:ui          # UI mode
npm run test:coverage    # With coverage report
npx vitest run --reporter=verbose  # Verbose output
```

### Test Configuration

#### Backend (Jest)
- **Config**: `jest.config.js`
- **Setup**: `tests/setup.ts`
- **Environment**: Node.js with SQLite test database
- **Coverage**: Istanbul/nyc

#### Frontend (Vitest)
- **Config**: `vitest.config.ts`
- **Setup**: `src/test/setup.ts`
- **Environment**: jsdom with React Testing Library
- **Coverage**: c8

### Continuous Integration

The tests are designed to run in CI/CD environments:

```bash
# CI test script example
#!/bin/bash
set -e

echo "Running backend tests..."
cd backend && npm test

echo "Running frontend tests..."
cd ../frontend && npm test

echo "All tests passed! ✅"
```

## 📁 Project Structure

```
polygon-management-assignment/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utilities and validation
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Database schema and migrations
│   ├── tests/               # Test files
│   │   ├── unit/            # Unit tests
│   │   ├── integration/     # Integration tests
│   │   └── setup.ts         # Test setup
│   ├── scripts/             # Database setup scripts
│   ├── Dockerfile           # Multi-stage Docker build
│   ├── jest.config.js       # Jest configuration
│   └── package.json         # Dependencies and scripts
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Canvas/      # Canvas components
│   │   │   └── PolygonList/ # Polygon list components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── test/            # Test setup
│   ├── public/              # Static assets
│   ├── Dockerfile           # Multi-stage Docker build
│   ├── vitest.config.ts     # Vitest configuration
│   └── package.json         # Dependencies and scripts
├── scripts/                 # Utility scripts
│   └── docker-setup.sh      # Docker deployment script
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
├── DOCKER.md               # Docker documentation
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

The application uses default configurations but supports customization:

**Backend (.env):**

```env
DATABASE_URL="file:./dev.db"
PORT=3001
API_DELAY_MS=5000
NODE_ENV=production
```

**Frontend:**

```env
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=15000
```

## 🎯 Assignment Requirements Fulfilled

✅ **Backend API**:

- Create polygon endpoint with name and points validation
- Delete polygon by ID endpoint
- Fetch all polygons endpoint with specified JSON format
- 5-second delay on all API operations
- Persistent storage with SQLite database

✅ **Frontend UI**:

- Interactive canvas with background image (https://picsum.photos/1920/1080)
- Click-to-draw polygon functionality
- List display of all existing polygons
- Delete existing polygons capability
- Polygon visualization overlay on image

✅ **Optional Requirements**:

- Comprehensive API tests (unit and integration)
- Frontend component and hook tests
- Docker containerization with multi-stage builds
- Production-ready Docker Compose setup

## 🚀 Deployment Notes

The application is containerized and ready for deployment:

- Uses multi-stage Docker builds for optimization
- Nginx serves the frontend with proper routing
- Health checks ensure service availability
- Volume persistence for database data
- Security headers and CORS configuration

## 📞 Support

For any questions about running or using the application, please refer to:

- Docker setup script: `./scripts/docker-setup.sh --help`
- Docker documentation: `DOCKER.md`
- API health check: `http://localhost:3001/health`

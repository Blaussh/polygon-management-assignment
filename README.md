# Polygon Management Web Application

A fullstack web application for managing polygons on a canvas, built with Node.js backend and React frontend.

## 🎯 Features

### Core Functionality

- **Interactive Canvas**: Draw polygons by clicking on a canvas with background image
- **Polygon Management**: Create, display, and delete polygons with names
- **Visual Interface**: List view of all polygons with selection and deletion capabilities
- **Persistent Storage**: Polygons saved to SQLite database, persist after server restarts
- **API Delays**: 5-second delay on all API operations as requested

### Advanced Features

- **Adaptive Text Sizing**: Polygon names automatically resize based on polygon dimensions
- **Smart Text Positioning**: Text positioned outside polygon when too large to fit inside
- **Interactive Feedback**: Hover effects, selection states, and visual indicators
- **Responsive Design**: Works on different screen sizes
- **Error Handling**: Comprehensive error handling and user feedback
- **Keyboard Shortcuts**: ESC key to cancel drawing

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed on your system

### Running the Application

```bash
# Clone the repository
git clone [your-repo-url]
cd NoTraffic

# Start the application (production mode)
docker-compose up -d

# Or use the setup script
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh start
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Stopping the Application

```bash
docker-compose down

# Or using the script
./scripts/docker-setup.sh stop
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

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
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

### Backend Tests

- Unit tests for validation logic
- Integration tests for API endpoints
- Database operation tests

### Frontend Tests

- Component unit tests
- Hook testing with React Testing Library
- API service tests

### Running All Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 📁 Project Structure

```
NoTraffic/
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
│   └── Dockerfile
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── tests/               # Test files
│   └── Dockerfile
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Docker Compose configuration
├── docker-compose.dev.yml   # Development Docker setup
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

The application uses default configurations but supports customization:

**Backend (.env):**

```env
DATABASE_URL="file:./dev.db"
PORT=5000
API_DELAY_MS=5000
NODE_ENV=production
```

**Frontend:**

```env
VITE_API_URL=http://localhost:5000
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
- API health check: `http://localhost:5000/health`

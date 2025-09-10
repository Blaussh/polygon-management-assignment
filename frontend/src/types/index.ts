// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Polygon Types
export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  id: number;
  name: string;
  points: Point[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolygonRequest {
  name: string;
  points: Point[];
}

// Canvas Types
export interface CanvasState {
  isDrawing: boolean;
  currentPolygon: Point[];
  selectedPolygonId: number | null;
  canvasSize: {
    width: number;
    height: number;
  };
  scale: number;
  offset: {
    x: number;
    y: number;
  };
}

export interface CanvasProps {
  polygons: Polygon[];
  onPolygonCreate: (polygon: CreatePolygonRequest) => void;
  onPolygonDelete: (id: number) => void;
  isLoading?: boolean;
}

// UI Types
export interface PolygonListProps {
  polygons: Polygon[];
  onPolygonDelete: (id: number) => void;
  onPolygonSelect: (id: number | null) => void;
  selectedPolygonId: number | null;
  isLoading?: boolean;
}

export interface PolygonItemProps {
  polygon: Polygon;
  isSelected: boolean;
  onDelete: (id: number) => void;
  onSelect: (id: number | null) => void;
}

// Error Types
export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

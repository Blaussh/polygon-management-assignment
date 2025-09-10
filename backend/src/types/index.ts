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

export interface PolygonData {
  id: number;
  name: string;
  points: Point[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePolygonRequest {
  name: string;
  points: Point[];
}

export interface CreatePolygonResponse extends ApiResponse<PolygonData> {}

export interface GetPolygonsResponse extends ApiResponse<PolygonData[]> {}

export interface DeletePolygonResponse extends ApiResponse<{ id: number }> {}

// Database Types (matching Prisma schema)
export interface PolygonEntity {
  id: number;
  name: string;
  points: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

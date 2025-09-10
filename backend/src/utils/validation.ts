import Joi from 'joi';
import { Point } from '../types';

const pointSchema = Joi.object({
  x: Joi.number().required().messages({
    'number.base': 'Point x coordinate must be a number',
    'any.required': 'Point x coordinate is required',
  }),
  y: Joi.number().required().messages({
    'number.base': 'Point y coordinate must be a number',
    'any.required': 'Point y coordinate is required',
  }),
});

export const createPolygonSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Polygon name cannot be empty',
    'string.min': 'Polygon name must be at least 1 character long',
    'string.max': 'Polygon name cannot be longer than 100 characters',
    'any.required': 'Polygon name is required',
  }),
  points: Joi.array().items(pointSchema).min(3).required().messages({
    'array.min': 'Polygon must have at least 3 points',
    'any.required': 'Points array is required',
  }),
});

export const polygonIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Polygon ID must be a number',
    'number.integer': 'Polygon ID must be an integer',
    'number.positive': 'Polygon ID must be positive',
    'any.required': 'Polygon ID is required',
  }),
});

export const validatePoints = (points: Point[]): string | null => {
  if (points.length < 3) {
    return 'Polygon must have at least 3 points';
  }

  // Check for duplicate consecutive points
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    if (!current || !next) {
      return 'Invalid point data';
    }

    if (current.x === next.x && current.y === next.y) {
      return 'Consecutive points cannot be identical';
    }
  }

  // Check for reasonable coordinate bounds (assuming canvas size)
  const maxCoordinate = 10000;
  const minCoordinate = -1000;

  for (const point of points) {
    if (
      point.x < minCoordinate ||
      point.x > maxCoordinate ||
      point.y < minCoordinate ||
      point.y > maxCoordinate
    ) {
      return `Point coordinates must be between ${minCoordinate} and ${maxCoordinate}`;
    }
  }

  return null;
};

// Check if polygon is self-intersecting (basic check)
export const isPolygonSelfIntersecting = (points: Point[]): boolean => {
  if (points.length < 4) return false;

  for (let i = 0; i < points.length; i++) {
    const line1Start = points[i];
    const line1End = points[(i + 1) % points.length];

    for (let j = i + 2; j < points.length; j++) {
      // Skip adjacent lines
      if (j === (i + points.length - 1) % points.length) continue;

      const line2Start = points[j];
      const line2End = points[(j + 1) % points.length];

      if (
        line1Start &&
        line1End &&
        line2Start &&
        line2End &&
        doLinesIntersect(line1Start, line1End, line2Start, line2End)
      ) {
        return true;
      }
    }
  }

  return false;
};

// Helper function to check if two line segments intersect
function doLinesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const denominator =
    (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  if (denominator === 0) return false; // Lines are parallel

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
    denominator;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    denominator;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

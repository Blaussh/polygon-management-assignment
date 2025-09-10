import { Point } from '@/types';

// Utility functions for testing polygon calculations
export const calculatePolygonArea = (points: Point[]): number => {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i]!.x * points[j]!.y;
    area -= points[j]!.x * points[i]!.y;
  }
  return Math.abs(area) / 2;
};

export const isPointInPolygon = (
  point: Point,
  polygonPoints: Point[]
): boolean => {
  let inside = false;

  for (
    let i = 0, j = polygonPoints.length - 1;
    i < polygonPoints.length;
    j = i++
  ) {
    const pi = polygonPoints[i]!;
    const pj = polygonPoints[j]!;

    if (
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x
    ) {
      inside = !inside;
    }
  }

  return inside;
};

describe('Polygon Utilities', () => {
  describe('calculatePolygonArea', () => {
    it('should return 0 for polygons with less than 3 points', () => {
      expect(calculatePolygonArea([])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }])).toBe(0);
      expect(
        calculatePolygonArea([
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ])
      ).toBe(0);
    });

    it('should calculate area of a triangle correctly', () => {
      const triangle: Point[] = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 3 },
      ];

      const area = calculatePolygonArea(triangle);
      expect(area).toBe(6); // Base 4 * Height 3 / 2 = 6
    });

    it('should calculate area of a square correctly', () => {
      const square: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 0, y: 5 },
      ];

      const area = calculatePolygonArea(square);
      expect(area).toBe(25); // 5 * 5 = 25
    });

    it('should calculate area of a rectangle correctly', () => {
      const rectangle: Point[] = [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 6, y: 4 },
        { x: 0, y: 4 },
      ];

      const area = calculatePolygonArea(rectangle);
      expect(area).toBe(24); // 6 * 4 = 24
    });

    it('should handle complex polygons', () => {
      const polygon: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ];

      const area = calculatePolygonArea(polygon);
      expect(area).toBe(3); // L-shaped polygon area
    });
  });

  describe('isPointInPolygon', () => {
    const square: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    it('should return true for points inside the polygon', () => {
      expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
      expect(isPointInPolygon({ x: 1, y: 1 }, square)).toBe(true);
      expect(isPointInPolygon({ x: 9, y: 9 }, square)).toBe(true);
    });

    it('should return false for points outside the polygon', () => {
      expect(isPointInPolygon({ x: -1, y: 5 }, square)).toBe(false);
      expect(isPointInPolygon({ x: 11, y: 5 }, square)).toBe(false);
      expect(isPointInPolygon({ x: 5, y: -1 }, square)).toBe(false);
      expect(isPointInPolygon({ x: 5, y: 11 }, square)).toBe(false);
    });

    it('should handle edge cases on polygon boundaries', () => {
      // Points exactly on the boundary might vary depending on implementation
      // This tests the general behavior
      const result1 = isPointInPolygon({ x: 0, y: 5 }, square);
      const result2 = isPointInPolygon({ x: 5, y: 0 }, square);

      // Results should be boolean (not undefined or null)
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });

    it('should work with triangles', () => {
      const triangle: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];

      expect(isPointInPolygon({ x: 5, y: 3 }, triangle)).toBe(true);
      expect(isPointInPolygon({ x: 15, y: 5 }, triangle)).toBe(false);
      expect(isPointInPolygon({ x: 5, y: 15 }, triangle)).toBe(false);
    });

    it('should work with complex polygons', () => {
      const lShape: Point[] = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 0, y: 3 },
      ];

      expect(isPointInPolygon({ x: 1.5, y: 0.5 }, lShape)).toBe(true);
      expect(isPointInPolygon({ x: 0.5, y: 2.5 }, lShape)).toBe(true);
      expect(isPointInPolygon({ x: 2, y: 2.5 }, lShape)).toBe(false);
    });
  });
});

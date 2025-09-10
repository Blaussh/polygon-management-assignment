import { useState, useRef, useCallback, useEffect } from 'react';
import { Point, Polygon, CanvasState } from '@/types';
import { config } from '@/env';

interface UseCanvasDrawingProps {
  polygons: Polygon[];
  onPolygonComplete: (points: Point[]) => void;
  onPolygonSelect: (id: number | null) => void;
}

export const useCanvasDrawing = ({
  polygons,
  onPolygonComplete,
  onPolygonSelect,
}: UseCanvasDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    isDrawing: false,
    currentPolygon: [],
    selectedPolygonId: null,
    canvasSize: {
      width: config.CANVAS_WIDTH,
      height: config.CANVAS_HEIGHT,
    },
    scale: 1,
    offset: { x: 0, y: 0 },
  });

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const colors = [
    '#2563EB',
    '#DC2626',
    '#059669',
    '#D97706',
    '#7C3AED',
    '#EA580C',
    '#0891B2',
    '#65A30D',
    '#BE185D',
    '#7C2D12',
  ];

  const getPolygonColor = (index: number) => {
    return colors[index % colors.length] || '#3B82F6';
  };

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      backgroundImageRef.current = img;
      redrawCanvas();
    };
    img.onerror = () => {
      redrawCanvas();
    };
    img.src = config.BACKGROUND_IMAGE_URL;
  }, []);

  // Redraw canvas whenever polygons or canvas state changes
  useEffect(() => {
    redrawCanvas();
  }, [polygons, canvasState.currentPolygon, canvasState.selectedPolygonId]);

  const getCanvasCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (backgroundImageRef.current) {
      ctx.drawImage(
        backgroundImageRef.current,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      // Fallback background
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw existing polygons
    polygons.forEach((polygon, index) => {
      if (polygon.points.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(polygon.points[0]!.x, polygon.points[0]!.y);

      for (let i = 1; i < polygon.points.length; i++) {
        const point = polygon.points[i];
        if (point) {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.closePath();

      const isSelected = canvasState.selectedPolygonId === polygon.id;
      const isHovered = hoveredId === polygon.id;
      const color = getPolygonColor(index);

      // Fill polygon
      ctx.fillStyle = isSelected
        ? `${color}60` // More opaque when selected
        : isHovered
          ? `${color}50` // Medium opacity when hovered
          : `${color}30`; // More visible semi-transparent
      ctx.fill();

      // Stroke polygon with much thicker, more visible lines
      ctx.strokeStyle = isSelected ? '#DC2626' : isHovered ? '#1F2937' : color;
      ctx.lineWidth = isSelected ? 5 : isHovered ? 5 : 4; // Much thicker lines
      ctx.stroke();

      // Add inner shadow
      if (isSelected) {
        ctx.beginPath();
        ctx.moveTo(polygon.points[0]!.x, polygon.points[0]!.y);
        for (let i = 1; i < polygon.points.length; i++) {
          const point = polygon.points[i];
          if (point) {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = '#991B1B'; // Darker red for inner line
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw vertices
      polygon.points.forEach(point => {
        if (point) {
          const radius = isSelected ? 8 : isHovered ? 7 : 6;
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = isSelected
            ? '#DC2626'
            : isHovered
              ? '#1F2937'
              : color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = isSelected ? 3 : isHovered ? 3 : 2; // Thicker white border
          ctx.stroke();

          // Add inner dot
          if (!isSelected) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, isHovered ? 3 : 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
          }
        }
      });

      // Draw polygon name
      if (polygon.points.length > 0 && polygon.points[0]) {
        // Calculate polygon bounds for adaptive sizing
        const minX = Math.min(...polygon.points.map(p => p?.x || 0));
        const maxX = Math.max(...polygon.points.map(p => p?.x || 0));
        const minY = Math.min(...polygon.points.map(p => p?.y || 0));
        const maxY = Math.max(...polygon.points.map(p => p?.y || 0));
        const polygonWidth = maxX - minX;
        const polygonHeight = maxY - minY;
        const polygonArea = polygonWidth * polygonHeight;

        const centerX =
          polygon.points.reduce((sum, p) => sum + (p?.x || 0), 0) /
          polygon.points.length;
        const centerY =
          polygon.points.reduce((sum, p) => sum + (p?.y || 0), 0) /
          polygon.points.length;

        // Adaptive font sizing based on polygon size
        let baseFontSize;
        if (polygonArea < 2000) {
          baseFontSize = 11; // Small polygons get smaller text
        } else if (polygonArea < 8000) {
          baseFontSize = 13; // Medium polygons
        } else if (polygonArea < 20000) {
          baseFontSize = 15; // Large polygons
        } else {
          baseFontSize = 17; // Very large polygons
        }

        const fontSize = isSelected
          ? baseFontSize + 3
          : isHovered
            ? baseFontSize + 2
            : baseFontSize;
        const fontWeight = isSelected ? 'bold' : isHovered ? 'bold' : '600';
        ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Measure text for background
        const textMetrics = ctx.measureText(polygon.name);
        const textWidth = textMetrics.width;
        const textHeight = fontSize + 4;

        // Adaptive padding based on font size
        const basePadding = Math.max(4, Math.floor(fontSize * 0.4));
        const padding = isSelected
          ? basePadding + 2
          : isHovered
            ? basePadding + 1
            : basePadding;

        // Check if text is too large for the polygon
        const textTooLarge =
          textWidth + padding * 2 > polygonWidth * 0.8 ||
          textHeight + padding * 2 > polygonHeight * 0.8;

        // Position text outside polygon if it's too large
        let textX = centerX;
        let textY = centerY;

        if (textTooLarge) {
          // Position text above the polygon
          textY = minY - textHeight / 2 - padding - 5;
          // If there's not enough space above, position below
          if (textY < textHeight / 2 + padding) {
            textY = maxY + textHeight / 2 + padding + 5;
          }
        }

        const borderRadius = Math.min(6, fontSize * 0.3);

        // Background with shadow and border
        const bgX = textX - textWidth / 2 - padding;
        const bgY = textY - textHeight / 2 - 2;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = textHeight + 4;

        // Draw shadow first - stronger shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = isSelected ? 12 : isHovered ? 10 : 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // Background with rounded corners - much more opaque
        ctx.fillStyle = isSelected
          ? 'rgba(255, 255, 255, 1.0)'
          : isHovered
            ? 'rgba(255, 255, 255, 0.98)'
            : 'rgba(255, 255, 255, 0.95)';

        // Draw rounded rectangle with fallback
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius);
        } else {
          // Fallback for browsers that don't support roundRect
          ctx.rect(bgX, bgY, bgWidth, bgHeight);
        }
        ctx.fill();

        // Add colored border matching polygon color - thicker border
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1.5;
        ctx.stroke();

        ctx.restore();

        // Draw text with much better contrast
        ctx.fillStyle = isSelected ? color : isHovered ? '#000000' : '#1F2937';

        // Add text stroke for all states for better visibility
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = isSelected ? 2 : isHovered ? 1.5 : 1;
        ctx.strokeText(polygon.name, textX, textY);

        ctx.fillText(polygon.name, textX, textY);

        // Add connecting line if text is positioned outside polygon
        if (textTooLarge) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(textX, textY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        // Add indicator dot for selected polygon - larger and more visible
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(
            textX + textWidth / 2 + padding - 5,
            textY - textHeight / 2 + 5,
            4,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });

    // Draw current polygon being drawn
    if (canvasState.currentPolygon.length > 0) {
      // Draw background line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.setLineDash([]);

      if (canvasState.currentPolygon.length > 1) {
        ctx.beginPath();
        const firstPoint = canvasState.currentPolygon[0];
        if (firstPoint) {
          ctx.moveTo(firstPoint.x, firstPoint.y);
          for (let i = 1; i < canvasState.currentPolygon.length; i++) {
            const point = canvasState.currentPolygon[i];
            if (point) {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.stroke();
        }
      }

      // Now draw the dashed line on top with bright color
      ctx.strokeStyle = '#EF4444'; // Bright red instead of blue
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]); // Longer dashes, shorter gaps

      if (canvasState.currentPolygon.length > 1) {
        ctx.beginPath();
        const firstPoint = canvasState.currentPolygon[0];
        if (firstPoint) {
          ctx.moveTo(firstPoint.x, firstPoint.y);
          for (let i = 1; i < canvasState.currentPolygon.length; i++) {
            const point = canvasState.currentPolygon[i];
            if (point) {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);

      // Draw vertices
      canvasState.currentPolygon.forEach((point, index) => {
        if (point) {
          // Outer glow effect
          ctx.beginPath();
          ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; // Red glow
          ctx.fill();

          // Main vertex circle
          ctx.beginPath();
          ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
          ctx.fillStyle = '#EF4444'; // Bright red
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Inner white dot for contrast
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Add vertex number for clarity
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((index + 1).toString(), point.x, point.y - 15);
        }
      });
    }
  }, [polygons, canvasState, getPolygonColor, hoveredId]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasState.isDrawing) return;

      const point = getCanvasCoordinates(event);

      // Check if this point is too close to the last point (prevent duplicates)
      const lastPoint =
        canvasState.currentPolygon[canvasState.currentPolygon.length - 1];
      if (lastPoint) {
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) +
            Math.pow(point.y - lastPoint.y, 2)
        );
        // Prevent points too close together
        if (distance < 5) {
          return;
        }
      }

      const newPolygon = [...canvasState.currentPolygon, point];

      setCanvasState(prev => ({
        ...prev,
        currentPolygon: newPolygon,
      }));
    },
    [canvasState.isDrawing, canvasState.currentPolygon, getCanvasCoordinates]
  );

  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      if (canvasState.isDrawing && canvasState.currentPolygon.length >= 3) {
        // Clean up any potential duplicate points before completing
        const cleanedPoints = removeDuplicatePoints(canvasState.currentPolygon);

        if (cleanedPoints.length >= 3) {
          // Complete the polygon
          onPolygonComplete(cleanedPoints);
          setCanvasState(prev => ({
            ...prev,
            isDrawing: false,
            currentPolygon: [],
          }));
        } else {
          console.warn('Not enough unique points to create a polygon');
        }
      }
    },
    [canvasState.isDrawing, canvasState.currentPolygon, onPolygonComplete]
  );

  const handleCanvasMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (canvasState.isDrawing) return;

      const point = getCanvasCoordinates(event);

      // Check if clicked on existing polygon
      const clickedPolygon = polygons.find(polygon => {
        if (polygon.points.length < 3) return false;
        return isPointInPolygon(point, polygon.points);
      });

      if (clickedPolygon) {
        onPolygonSelect(clickedPolygon.id);
        setCanvasState(prev => ({
          ...prev,
          selectedPolygonId: clickedPolygon.id,
        }));
      } else {
        onPolygonSelect(null);
        setCanvasState(prev => ({
          ...prev,
          selectedPolygonId: null,
        }));
      }
    },
    [canvasState.isDrawing, polygons, getCanvasCoordinates, onPolygonSelect]
  );

  const startDrawing = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      isDrawing: true,
      currentPolygon: [],
      selectedPolygonId: null,
    }));
  }, []);

  const cancelDrawing = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      isDrawing: false,
      currentPolygon: [],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      selectedPolygonId: null,
    }));
    onPolygonSelect(null);
  }, [onPolygonSelect]);

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (canvasState.isDrawing) return; // Don't show hover effects while drawing

      const point = getCanvasCoordinates(event);
      let foundHoveredPolygon: number | null = null;

      // Check if mouse is over any polygon
      for (let i = 0; i < polygons.length; i++) {
        const polygon = polygons[i];
        if (polygon && polygon.points.length >= 3) {
          if (isPointInPolygon(point, polygon.points)) {
            foundHoveredPolygon = polygon.id;
            break;
          }
        }
      }

      if (foundHoveredPolygon !== hoveredId) {
        setHoveredId(foundHoveredPolygon);
      }
    },
    [polygons, canvasState.isDrawing, hoveredId, getCanvasCoordinates]
  );

  return {
    canvasRef,
    canvasState,
    handleCanvasClick,
    handleCanvasDoubleClick,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    startDrawing,
    cancelDrawing,
    clearSelection,
    redrawCanvas,
  };
};

// Helper function to remove duplicate consecutive points
function removeDuplicatePoints(points: Point[]): Point[] {
  if (points.length <= 1) return points;

  const cleaned: Point[] = [points[0]!];

  for (let i = 1; i < points.length; i++) {
    const current = points[i]!;
    const last = cleaned[cleaned.length - 1]!;

    // Only add point if it's sufficiently different from the last point
    const distance = Math.sqrt(
      Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2)
    );

    if (distance >= 5) {
      // Same threshold as click handler
      cleaned.push(current);
    }
  }

  // Also check if the last point is too close to the first (closing the polygon)
  if (cleaned.length > 2) {
    const first = cleaned[0]!;
    const last = cleaned[cleaned.length - 1]!;
    const distance = Math.sqrt(
      Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
    );

    if (distance < 5) {
      cleaned.pop(); // Remove the last point if it's too close to the first
    }
  }

  return cleaned;
}

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point: Point, polygonPoints: Point[]): boolean {
  let inside = false;

  for (
    let i = 0, j = polygonPoints.length - 1;
    i < polygonPoints.length;
    j = i++
  ) {
    const pi = polygonPoints[i];
    const pj = polygonPoints[j];

    if (!pi || !pj) continue;

    if (
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x
    ) {
      inside = !inside;
    }
  }

  return inside;
}

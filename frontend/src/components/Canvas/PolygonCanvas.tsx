import React, { useState, useEffect } from 'react';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';
import { CanvasProps, Point } from '@/types';
import { config } from '@/env';
import clsx from 'clsx';

interface PolygonNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading?: boolean;
}

const PolygonNameModal: React.FC<PolygonNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Name Your Polygon</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter polygon name..."
            className="input w-full mb-4"
            autoFocus
            disabled={isLoading}
            maxLength={100}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Creating...
                </>
              ) : (
                'Create Polygon'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const PolygonCanvas: React.FC<
  CanvasProps & {
    onStartDrawing?: () => void;
    onStopDrawing?: () => void;
    isDrawing?: boolean;
  }
> = ({
  polygons,
  onPolygonCreate,
  onPolygonDelete,
  isLoading = false,
  onStartDrawing,
  onStopDrawing,
  isDrawing = false,
}) => {
  const [pendingPolygon, setPendingPolygon] = useState<Point[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    canvasRef,
    canvasState,
    handleCanvasClick,
    handleCanvasDoubleClick,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    startDrawing,
    cancelDrawing,
    clearSelection,
  } = useCanvasDrawing({
    polygons,
    onPolygonComplete: (points: Point[]) => {
      setPendingPolygon(points);
      setIsModalOpen(true);
    },
    onPolygonSelect: () => {},
  });

  useEffect(() => {
    if (isDrawing && !canvasState.isDrawing) {
      startDrawing();
    }
  }, [isDrawing, canvasState.isDrawing, startDrawing]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawing) {
        event.preventDefault();
        cancelDrawing();
        if (onStopDrawing) {
          onStopDrawing();
        }
      }
    };

    if (isDrawing) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, cancelDrawing, onStopDrawing]);

  const handleCreatePolygon = async (name: string) => {
    if (!pendingPolygon) return;

    setIsCreating(true);
    try {
      await onPolygonCreate({
        name,
        points: pendingPolygon,
      });
      setIsModalOpen(false);
      setPendingPolygon(null);
      cancelDrawing();
      if (onStopDrawing) {
        onStopDrawing();
      }
    } catch (error) {
      console.error('Failed to create polygon:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingPolygon(null);
    cancelDrawing();
    if (onStopDrawing) {
      onStopDrawing();
    }
  };

  const handleCancelDrawing = () => {
    cancelDrawing();
    if (onStopDrawing) {
      onStopDrawing();
    }
  };

  const selectedPolygon = canvasState.selectedPolygonId
    ? polygons.find(p => p.id === canvasState.selectedPolygonId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Draw New Polygon Button */}
      <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200">
        <button
          onClick={onStartDrawing}
          disabled={isDrawing || isLoading}
          className="btn btn-primary"
        >
          {isDrawing ? 'Drawing...' : 'Draw New Polygon'}
        </button>
      </div>

      {/* Canvas Controls - Fixed Height */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200 min-h-[120px]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Polygon Canvas</h2>
          {isLoading && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="loading-spinner mr-2" />
              Loading...
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap min-h-[60px] items-start">
          {isDrawing ? (
            <>
              <div className="text-xs text-gray-600">
                Click to add points, double-click to finish
                {canvasState.currentPolygon.length > 0 && (
                  <span className="ml-1 text-blue-600 font-medium">
                    ({canvasState.currentPolygon.length} points)
                  </span>
                )}
              </div>
              <button
                onClick={handleCancelDrawing}
                className="btn btn-secondary"
              >
                Cancel Drawing
              </button>
            </>
          ) : (
            <>
              {selectedPolygon && (
                <>
                  <button
                    onClick={() => onPolygonDelete(selectedPolygon.id)}
                    className="btn btn-danger"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={clearSelection}
                    className="btn btn-secondary"
                  >
                    Clear Selection
                  </button>
                  <div className="text-sm text-gray-600">
                    Selected:{' '}
                    <span className="font-medium">{selectedPolygon.name}</span>
                  </div>
                </>
              )}
              {!selectedPolygon && (
                <div className="text-sm text-gray-500">
                  Click on a polygon to select it, or start drawing a new one.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div
          className={clsx(
            'canvas-container h-full w-full flex items-center justify-center p-4',
            canvasState.isDrawing && 'drawing'
          )}
        >
          <canvas
            ref={canvasRef}
            width={config.CANVAS_WIDTH}
            height={config.CANVAS_HEIGHT}
            className="polygon-canvas border border-gray-300 rounded-lg shadow-sm max-w-full max-h-full"
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: 'calc(100% - 2rem)',
              maxHeight: 'calc(100% - 2rem)',
              objectFit: 'contain',
              cursor: canvasState.isDrawing ? 'crosshair' : 'default',
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200 min-h-[4rem]">
        <div className="text-sm text-gray-600">
          {isDrawing ? (
            <div className="flex flex-wrap gap-4">
              <span className="text-blue-600 font-medium">
                🎯 Drawing: Click to add points (
                {canvasState.currentPolygon.length})
              </span>
              <span className="text-blue-600">
                • Double-click to finish (need{' '}
                {Math.max(0, 3 - canvasState.currentPolygon.length)} more)
              </span>
              <span className="text-gray-500">• 5+ pixels apart</span>
              <span className="text-red-500">• Escape to cancel</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <span>
                • <strong>Draw:</strong> Click "Draw New Polygon" and click on
                canvas to add points
              </span>
              <span>
                • <strong>Finish:</strong> Double-click to complete polygon
              </span>
              <span>
                • <strong>Select:</strong> Click on existing polygon to select
              </span>
              <span>
                • <strong>Delete:</strong> Select a polygon and click "Delete
                Selected"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Polygon Name Modal */}
      <PolygonNameModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreatePolygon}
        isLoading={isCreating}
      />
    </div>
  );
};

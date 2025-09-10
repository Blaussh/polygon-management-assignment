import React from 'react';
import { PolygonListProps } from '@/types';
import { PolygonItem } from './PolygonItem';

export const PolygonList: React.FC<PolygonListProps> = ({
  polygons,
  onPolygonDelete,
  onPolygonSelect,
  selectedPolygonId,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Polygons</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <div className="loading-spinner" />
            <span>Loading polygons...</span>
          </div>
        </div>
      </div>
    );
  }

  if (polygons.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Polygons</h2>
          <p className="text-sm text-gray-600 mt-1">No polygons created yet</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 max-w-sm mx-auto px-4">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No polygons yet
            </h3>
            <p className="text-gray-600">
              Start by clicking "Draw New Polygon" on the canvas to create your
              first polygon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Polygons</h2>
            <p className="text-sm text-gray-600 mt-1">
              {polygons.length} polygon{polygons.length !== 1 ? 's' : ''} total
            </p>
          </div>

          {selectedPolygonId && (
            <button
              onClick={() => onPolygonSelect(null as any)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-3">
          {polygons.map(polygon => (
            <PolygonItem
              key={polygon.id}
              polygon={polygon}
              isSelected={selectedPolygonId === polygon.id}
              onDelete={onPolygonDelete}
              onSelect={onPolygonSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

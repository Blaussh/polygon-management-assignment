import React from 'react';
import { PolygonItemProps } from '@/types';
import clsx from 'clsx';

export const PolygonItem: React.FC<PolygonItemProps> = ({
  polygon,
  isSelected,
  onDelete,
  onSelect,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateArea = () => {
    if (polygon.points.length < 3) return 0;

    let area = 0;
    const n = polygon.points.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const pi = polygon.points[i];
      const pj = polygon.points[j];

      if (pi && pj) {
        area += pi.x * pj.y;
        area -= pj.x * pi.y;
      }
    }

    return Math.abs(area) / 2;
  };

  const area = calculateArea();

  return (
    <div
      className={clsx(
        'card p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      )}
      onClick={() => onSelect(polygon.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{polygon.name}</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Points:</span>
              <span className="font-medium">{polygon.points.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Area:</span>
              <span className="font-medium">{area.toFixed(1)} px²</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span className="font-medium">
                {formatDate(polygon.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(polygon.id);
          }}
          className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete polygon"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Points preview */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-2">Points:</div>
        <div className="max-h-20 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {polygon.points.slice(0, 5).map((point, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono">
                {index + 1}: ({point.x.toFixed(1)}, {point.y.toFixed(1)})
              </div>
            ))}
            {polygon.points.length > 5 && (
              <div className="text-xs text-gray-400">
                ... and {polygon.points.length - 5} more points
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

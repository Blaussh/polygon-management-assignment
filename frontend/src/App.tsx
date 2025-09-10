import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { PolygonCanvas } from '@/components/Canvas/PolygonCanvas';
import { PolygonList } from '@/components/PolygonList/PolygonList';
import {
  usePolygons,
  useCreatePolygon,
  useDeletePolygon,
} from '@/hooks/usePolygons';
import { CreatePolygonRequest } from '@/types';
// import { config } from '@/env';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const [selectedPolygonId, setSelectedPolygonId] = useState<number | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);

  const { data: polygons = [], isLoading, error } = usePolygons();
  const createPolygonMutation = useCreatePolygon();
  const deletePolygonMutation = useDeletePolygon();

  const handlePolygonCreate = async (polygon: CreatePolygonRequest) => {
    await createPolygonMutation.mutateAsync(polygon);
  };

  const handlePolygonDelete = async (id: number) => {
    if (selectedPolygonId === id) {
      setSelectedPolygonId(null);
    }
    await deletePolygonMutation.mutateAsync(id);
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setSelectedPolygonId(null); // Clear selection when starting to draw
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Failed to load polygons
              </h3>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {error.message ||
              'Unable to connect to the server. Please check if the backend is running.'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Polygon List */}
      <div className="w-80 bg-white shadow-lg flex-shrink-0">
        <PolygonList
          polygons={polygons}
          onPolygonDelete={handlePolygonDelete}
          onPolygonSelect={setSelectedPolygonId}
          selectedPolygonId={selectedPolygonId}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content - Canvas */}
      <div className="flex-1 flex flex-col">
        <PolygonCanvas
          polygons={polygons}
          onPolygonCreate={handlePolygonCreate}
          onPolygonDelete={handlePolygonDelete}
          isLoading={isLoading}
          onStartDrawing={handleStartDrawing}
          onStopDrawing={handleStopDrawing}
          isDrawing={isDrawing}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* {config.ENABLE_DEVTOOLS && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
};

export default App;

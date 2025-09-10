import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { CreatePolygonRequest, Polygon } from '@/types';
import toast from 'react-hot-toast';

export const usePolygons = () => {
  return useQuery({
    queryKey: ['polygons'],
    queryFn: async () => {
      const result = await apiService.getPolygons();
      return result;
    },
    staleTime: 30000,
    retry: 2,
    retryDelay: attemptIndex => Math.min(3000 * 2 ** attemptIndex, 10000),
  });
};

export const useCreatePolygon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (polygon: CreatePolygonRequest) =>
      apiService.createPolygon(polygon),
    onSuccess: newPolygon => {
      queryClient.setQueryData<Polygon[]>(['polygons'], oldData =>
        oldData ? [newPolygon, ...oldData] : [newPolygon]
      );
      toast.success(`Polygon "${newPolygon.name}" created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create polygon: ${error.message}`);
    },
  });
};

export const useDeletePolygon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deletePolygon(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Polygon[]>(['polygons'], oldData =>
        oldData ? oldData.filter(polygon => polygon.id !== deletedId) : []
      );
      toast.success('Polygon deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete polygon: ${error.message}`);
    },
  });
};

export const usePolygonById = (id: number) => {
  return useQuery({
    queryKey: ['polygon', id],
    queryFn: () => apiService.getPolygonById(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

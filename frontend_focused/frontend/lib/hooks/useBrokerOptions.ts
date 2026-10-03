'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Broker } from '@/lib/types';

// GET /api/brokers/ -> Broker[], sorted by name. The backend serves brokers as a plain,
// unpaginated array because the dropdown needs all of them.
async function fetchBrokers(signal?: AbortSignal) {
  const response = await apiClient.get<Broker[]>('/brokers/', { signal });
  return response.data;
}

// React Query hook backing the Broker filter. Brokers rarely change, so the list is cached
// for 5 minutes and shared by every component that asks for it.
export function useBrokerOptions() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: ({ signal }) => fetchBrokers(signal),
    staleTime: 5 * 60_000,
  });
}

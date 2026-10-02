'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Broker } from '@/lib/types';

// GET /api/brokers/ -> Broker[]. Typed as a plain array, but with the project's global
// DRF pagination the response would be a PaginatedResponse<Broker> unless the brokers
// endpoint disables pagination.
async function fetchBrokers() {
  const response = await apiClient.get<Broker[]>('/brokers/');
  return response.data;
}

// React Query hook backing the Broker filter dropdown. The 'brokers' key caches the list
// once for the whole app. `enabled: false` means it never fetches automatically yet.
export function useBrokerOptions() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: fetchBrokers,
    enabled: false,
  });
}

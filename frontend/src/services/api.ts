import axios from 'axios';
import {
  Facility,
  MapMarker,
  InventoryItem,
  HealthAlert,
  RedistributionRecommendation,
  NationalSummary,
  FederatedStatus,
} from '../types';

const getBaseUrl = (): string => {
  let url = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url += '/api/v1';
  }
  return url;
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Facilities
  getFacilities: (params?: { state?: string; district?: string; query?: string; limit?: number }) =>
    apiClient.get<{ total: number; items: Facility[] }>('/facilities/', { params }),
  getMapMarkers: (params?: { state?: string; district?: string }) =>
    apiClient.get<{ markers: MapMarker[] }>('/facilities/map-markers', { params }),
  getFacilityDetail: (id: number) =>
    apiClient.get(`/facilities/${id}`),

  // Inventory
  getInventory: (params?: { facility_id?: number; district?: string; status?: string; category?: string; limit?: number }) =>
    apiClient.get<{ total: number; items: InventoryItem[] }>('/inventory/', { params }),
  updateStock: (data: { facility_id: number; medicine_id: number; quantity_delta: number; reason?: string }) =>
    apiClient.post('/inventory/update', data),

  // Forecasting
  getSingleForecast: (facilityId: number, medicineId: number) =>
    apiClient.get(`/forecasting/facility/${facilityId}/medicine/${medicineId}`),
  getCriticalWatchlist: (params?: { state?: string; district?: string; limit?: number }) =>
    apiClient.get('/forecasting/critical-watchlist', { params }),

  // Redistribution
  getRecommendations: (district?: string) =>
    apiClient.get<{ count: number; recommendations: RedistributionRecommendation[] }>('/redistribution/recommendations', {
      params: { district },
    }),
  approveDispatch: (data: {
    source_facility_id: number;
    destination_facility_id: number;
    medicine_id: number;
    quantity: number;
    vehicle_no?: string;
    driver_name?: string;
  }) => apiClient.post('/redistribution/dispatch', data),
  getActiveTransfers: () =>
    apiClient.get('/redistribution/active-transfers'),

  // Multimodal OCR
  scanRegister: (formData: FormData) =>
    apiClient.post('/multimodal/scan-register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Indic Voice
  processVoice: (data: { transcript: string; language_code?: string; facility_id?: number }) =>
    apiClient.post('/voice/process', data),
  getSupportedLanguages: () =>
    apiClient.get('/voice/languages'),

  // Federated
  getFederatedStatus: () =>
    apiClient.get<FederatedStatus>('/federated/status'),
  trainFederatedRound: () =>
    apiClient.post<FederatedStatus>('/federated/train-round'),

  // Analytics & Alerts
  getNationalSummary: () =>
    apiClient.get<NationalSummary>('/analytics/national-summary'),
  getAlerts: () =>
    apiClient.get<{ alerts: HealthAlert[] }>('/alerts/'),
};

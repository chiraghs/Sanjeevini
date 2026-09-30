export interface Facility {
  id: number;
  code: string;
  name: string;
  type: string;
  facility_type?: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  occupied_beds: number;
  bed_occupancy_pct: number;
  icu_beds: number;
  oxygen_points: number;
  cold_chain_functional: boolean;
  contact_phone?: string;
}

export interface MapMarker {
  id: number;
  name: string;
  type: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  beds_total: number;
  beds_occupied: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  critical_stockouts_count: number;
  cold_chain: boolean;
}

export interface InventoryItem {
  id: number;
  facility_id: number;
  facility_name: string;
  district: string;
  state: string;
  medicine_id: number;
  medicine_name: string;
  category: string;
  unit: string;
  batch_no: string;
  current_stock: number;
  daily_burn_rate: number;
  days_to_stockout: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL' | 'STOCKOUT';
  expiry_date: string;
  requires_cold_chain: boolean;
}

export interface HealthAlert {
  id: number;
  title: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  state: string;
  district: string;
  disease?: string;
  description: string;
  ai_mitigation?: string;
  created_at: string;
}

export interface RedistributionRecommendation {
  recommendation_id: string;
  medicine_id: number;
  medicine_name: string;
  medicine_category: string;
  requires_cold_chain: boolean;
  quantity: number;
  recipient_facility: {
    id: number;
    name: string;
    district: string;
    state: string;
    current_stock: number;
    days_to_stockout: number;
  };
  donor_facility: {
    id: number;
    name: string;
    district: string;
    state: string;
    current_stock: number;
    days_to_stockout: number;
    batch_no: string;
    expiry_date: string;
  };
  distance_km: number;
  estimated_transit_hours: number;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  ai_rationale: string;
}

export interface NationalSummary {
  total_facilities: number;
  facility_breakdown: {
    PHC: number;
    CHC: number;
    DH: number;
  };
  beds: {
    total: number;
    occupied: number;
    available: number;
    occupancy_rate_pct: number;
  };
  inventory_health: {
    critical_stockouts: number;
    warning_stockouts: number;
    national_resilience_score: number;
  };
  active_alerts_count: number;
  active_transfers_count: number;
}

export interface FederatedStatus {
  current_round: number;
  global_model_version: string;
  global_loss: number;
  global_accuracy: number;
  differential_privacy_epsilon: number;
  state_nodes: Array<{
    state_code: string;
    state_name: string;
    active_phcs: number;
    samples_trained: number;
    local_loss: number;
    local_accuracy: number;
    privacy_budget_consumed: number;
    last_gradient_sync: string;
    status: string;
  }>;
  brics_nodes?: Array<{
    country_code: string;
    country_name: string;
    flag: string;
    institution: string;
    active_centers: number;
    samples_trained: number;
    focus_area: string;
    privacy_model: string;
    local_loss: number;
    local_accuracy: number;
    status: string;
    last_sync: string;
  }>;
  training_history: Array<{
    round: number;
    global_loss: number;
    global_accuracy: number;
    participating_nodes: number;
  }>;
  data_sovereignty_compliance: string;
}

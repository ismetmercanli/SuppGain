export interface DashboardIntakeRow {
  rowId: string;
  trackerId: string;
  slotIndex: number;
  productId: string;
  productName: string;
  plannedTimeLocal: string;
  contextHint: string;
  doseAmount: number;
  isCompleted: boolean;
  loggedAtUtc: string | null;
  status: 'completed' | 'due' | 'upcoming';
}

export interface DashboardStockAlert {
  trackerId: string;
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
  severity: 'urgent' | 'warning';
}

export interface SupplementDashboard {
  localDate: string;
  totalScheduledDoses: number;
  completedDoses: number;
  compliancePercent: number;
  lastCompletedProductName: string | null;
  lastCompletedAtUtc: string | null;
  intakes: DashboardIntakeRow[];
  stockAlerts: DashboardStockAlert[];
}

export interface CreateSupplementTrackerPayload {
  productId: string;
  dailyDosage: number;
  timesPerDay: number;
  timesOfDayJson: string;
  currentStock: number;
  lowStockThreshold: number;
}

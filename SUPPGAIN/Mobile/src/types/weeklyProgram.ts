export interface WeeklyProgram {
  programId: string;
  userId: string;
  title: string;
  contentJson: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface SaveWeeklyProgramRequest {
  title: string;
  contentJson: string;
}

export interface WeeklyAutoCreateRequest {
  title?: string;
  selectedProductIds?: string[];
}

export interface WeeklyManualScheduleItem {
  day: string;
  slot: string;
  productId: string;
  productName: string;
  category: string;
  dosage: string;
  note: string;
}


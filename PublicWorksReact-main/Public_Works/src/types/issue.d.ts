export interface Category {
  categoryId: number;
  name: string;
}

export interface Priority {
  priorityId: number;
  name: string;
}

export interface Status {
  statusId: number;
  name: string;
}

// This matches your Issue create payload
export interface IssueCreateRequest {
  CategoryId: number;
  priorityId: number;
  statusId: number;
  description: string;
  locationText: string; // WKT format string like "POINT(long lat)"
}

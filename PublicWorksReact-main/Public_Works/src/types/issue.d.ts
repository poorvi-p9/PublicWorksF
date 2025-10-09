/**
 * ======================================
 * 🧩 Issue Type Definitions
 * ======================================
 * These types define the structure of issue-related
 * entities in both frontend and backend payloads.
 * They are consistent with ASP.NET Core model naming.
 */

/* --------------------------------------------
   🔹 Category, Priority, Status
--------------------------------------------- */
export interface Category {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
}

export interface Status {
  id: number;
  name: string;
}

/* --------------------------------------------
   🔹 Issue Create Request Payload
--------------------------------------------- */
export interface IssueCreateRequest {
  CategoryId: number;       // Reference to Category
  priorityId: number;       // Reference to Priority
  statusId: number;         // Reference to Status
  description: string;      // Description of issue
  locationText: string;     // Human-readable or WKT format
  phoneNumber: string;      // Use string to support +91 / formatted numbers
  latitude?: number;        // Optional latitude
  longitude?: number;       // Optional longitude
}

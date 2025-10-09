import type { IssueCreateRequest, Category, Priority, Status } from "../types/issue";

const API_BASE = "http://localhost:5142/api";

/* --------------------------------------------
   🔹 Helper for all fetch requests
--------------------------------------------- */
async function fetchWithAuth<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ API Error [${endpoint}] →`, text);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    // Handle cases with no JSON body (e.g., 204 No Content)
    const contentType = res.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      return (await res.json()) as T;
    }

    return {} as T;
  } catch (err) {
    console.error(`🚨 Network or Fetch Error [${endpoint}] →`, err);
    throw new Error(`Failed to fetch: ${endpoint}`);
  }
}

/* --------------------------------------------
   🔹 Create Issue (with images + optional lat/lon)
--------------------------------------------- */
export async function createIssue(
  data: IssueCreateRequest & { images?: File[] },
  token: string
): Promise<any> {
  const formData = new FormData();

  // Safely append values (only if they exist)
  const safeAppend = (key: string, value: any) => {
    if (value !== undefined && value !== null) formData.append(key, value.toString());
  };

  safeAppend("categoryId", data.CategoryId);
  safeAppend("priorityId", data.priorityId);
  safeAppend("statusId", data.statusId);
  safeAppend("description", data.description);
  safeAppend("locationText", data.locationText);
  safeAppend("phoneNumber", data.phoneNumber);

  // Optional: latitude/longitude if available
  if (data.latitude) safeAppend("latitude", data.latitude);
  if (data.longitude) safeAppend("longitude", data.longitude);

  // Append multiple images
  data.images?.forEach((file) => formData.append("images", file));

  return await fetchWithAuth<any>("Issue/submit", token, {
    method: "POST",
    body: formData,
  });
}

/* --------------------------------------------
   🔹 Generic Fetcher for Lookup Lists
--------------------------------------------- */
export const getCategories = (token: string) =>
  fetchWithAuth<Category[]>("Category", token);

export const getPriorities = (token: string) =>
  fetchWithAuth<Priority[]>("Priority", token);

export const getStatuses = (token: string) =>
  fetchWithAuth<Status[]>("Status", token);

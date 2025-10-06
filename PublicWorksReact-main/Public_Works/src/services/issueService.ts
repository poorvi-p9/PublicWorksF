import type { IssueCreateRequest, Category, Priority, Status } from "../types/issue";

const API_BASE = "http://localhost:5142/api/Issue/submit";

// Corrected createIssue to return the created issue object
export async function createIssue(
  data: IssueCreateRequest & { images: File[] },
  token: string
): Promise<any> {
  const formData = new FormData();
  formData.append("UserId", "1"); // Replace with real user ID if needed
  formData.append("CategoryId", data.CategoryId.toString());
  formData.append("priorityId", data.priorityId.toString());
  formData.append("statusId", data.statusId.toString());
  formData.append("description", data.description);
  formData.append("locationText", data.locationText);

  if (data.latitude) formData.append("latitude", data.latitude);
  if (data.longitude) formData.append("longitude", data.longitude);
  if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);

  // Attach images
  data.images.forEach((file) => {
    formData.append("images", file); // Must match backend property
  });

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: Do NOT set Content-Type when using FormData
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error submitting issue:", errorText);
    throw new Error(`Failed to create issue: ${res.status} - ${errorText}`);
  }

  // ✅ Return the JSON response
  const result = await res.json();
  return result;
}

// Fetch categories
export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch("http://localhost:5142/api/Category", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// Fetch priorities
export async function getPriorities(token: string): Promise<Priority[]> {
  const res = await fetch("http://localhost:5000/api/priorities", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch priorities");
  return res.json();
}

// Fetch statuses
export async function getStatuses(token: string): Promise<Status[]> {
  const res = await fetch("http://localhost:5000/api/statuses", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch statuses");
  return res.json();
}

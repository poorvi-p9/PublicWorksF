import type { IssueCreateRequest, Category, Priority, Status } from "../types/issue";

const API_BASE = "http://localhost:5142/api/Issue/submit";

export async function createIssue(data: IssueCreateRequest & { images: File[] }, token: string): Promise<void> {
  const formData = new FormData();
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
    formData.append("images", file); // name must match backend property
  });

  const res = await fetch("http://localhost:5142/api/Issue/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type manually for FormData
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error submitting issue:", errorText);
    throw new Error(`Failed to create issue: ${res.status} - ${errorText}`);
  }
}

// These endpoints assumed - adapt if different

export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch("http://localhost:5142/api/Category", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getPriorities(token: string): Promise<Priority[]> {
  const res = await fetch("http://localhost:5000/api/priorities", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch priorities");
  return res.json();
}

export async function getStatuses(token: string): Promise<Status[]> {
  const res = await fetch("http://localhost:5000/api/statuses", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch statuses");
  return res.json();
}

import type { IssueCreateRequest, Category, Priority, Status } from "../types/issue";

const API_BASE = "http://localhost:5142/api/Issue/submit";

// ✅ Create Issue with Lat/Lon + Images
export async function createIssue(
  data: IssueCreateRequest & { images: File[] },
  token: string
): Promise<any> {
  const formData = new FormData();
  formData.append("CategoryId", data.CategoryId.toString());
  formData.append("priorityId", data.priorityId.toString());
  formData.append("statusId", data.statusId.toString());
  formData.append("description", data.description);
  formData.append("locationText", data.locationText);
  formData.append("latitude", data.latitude);
  formData.append("longitude", data.longitude);
  formData.append("phoneNumber", data.phoneNumber);

  // ✅ Attach images (with lat/lon included in metadata if backend supports)
  data.images.forEach((file) => {
    formData.append("images", file);
  });

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error submitting issue:", errorText);
    throw new Error(`Failed to create issue: ${res.status} - ${errorText}`);
  }

  const result = await res.json();
  return result;
}

// ✅ Fetch categories
export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch("http://localhost:5142/api/Category", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// ✅ Fetch priorities
export async function getPriorities(token: string): Promise<Priority[]> {
  const res = await fetch("http://localhost:5142/api/Priority", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch priorities");
  return res.json();
}

// ✅ Fetch statuses
export async function getStatuses(token: string): Promise<Status[]> {
  const res = await fetch("http://localhost:5142/api/Status", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch statuses");
  return res.json();
}

// import type { AuthResponse } from '../types/auth';

// const API_URL = 'http://localhost:5142/api/auth'; // ✅ Backend base URL

// // ✅ Normal login with username/password/role
// export const login = async (
  
//   username: string,
//   password: string,
//   role: string
// ): Promise<AuthResponse> => {
//   const response = await fetch(`${API_URL}/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ username, password, role }), // ✅ Proper payload
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Login failed: ${errorText}`);
//   }

//   return response.json(); // ✅ Should return AuthResponse (token, user info, etc.)
// };

// // ✅ Google login using ID token from Google OAuth
// export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
//   try {
//     const response = await fetch(`${API_URL}/google`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json', // ✅ Important for JSON body
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({ idToken }), // ✅ Send in body, NOT query string
      
//     });
// console.log(idToken);
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Google login failed: ${errorText}`);
//     }

//     return response.json(); // ✅ Should return AuthResponse
//   } catch (error) {
//     console.error('Google login error:', error);
//     throw error;
//   }
// };

import type { AuthResponse } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5142/api/auth";

/* --------------------------------------------
   🔹 Generic API Fetch Helper (with better error handling)
--------------------------------------------- */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // ⏳ 10s timeout

  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeout);

    // 🧩 Handle Non-OK HTTP Responses
    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const text = await res.text();
        errorMsg += `: ${text || res.statusText}`;
      } catch {
        // fallback to status text
      }
      console.error(`❌ API Error [${endpoint}] →`, errorMsg);
      throw new Error(errorMsg);
    }

    // ✅ Handle JSON or Empty Response
    const contentType = res.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      return (await res.json()) as T;
    }

    return {} as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("⏰ Request timeout. Please check your connection.");
    }
    console.error(`🚨 Network/API Failure [${endpoint}] →`, error);
    throw new Error(error.message || "Network error occurred");
  }
}

/* --------------------------------------------
   🔹 Normal Login (username + password + role)
--------------------------------------------- */
export async function login(
  username: string,
  password: string,
  role: string
): Promise<AuthResponse> {
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  const payload = { username, password, role };
  return apiFetch<AuthResponse>("login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* --------------------------------------------
   🔹 Google Login (with ID Token)
--------------------------------------------- */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
  if (!idToken) {
    throw new Error("Google ID token missing. Please try signing in again.");
  }

  return apiFetch<AuthResponse>("google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

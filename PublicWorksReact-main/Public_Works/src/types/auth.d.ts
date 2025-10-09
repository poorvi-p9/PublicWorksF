/**
 * ======================================
 * 🔐 Authentication Type Definitions
 * ======================================
 * These types describe responses and user data
 * for normal + Google OAuth login flows.
 */

/* --------------------------------------------
   🔹 Standard Auth Response (Backend API)
--------------------------------------------- */
export interface AuthResponse {
  token: string; // JWT or bearer token

  user: {
    id: string | number;     // Some APIs use numeric IDs
    username: string;
    email?: string;          // Optional email for flexibility
    role?: string;           // Optional user role (Admin, User, etc.)
    profileImage?: string;   // Optional profile image URL
    createdAt?: string;      // Optional ISO date string
    updatedAt?: string;      // Optional ISO date string

    // Allow extra backend fields safely
    [key: string]: any;
  };
}

/* --------------------------------------------
   🔹 Google OAuth User Info (Client-Side)
--------------------------------------------- */
export interface GoogleUser {
  sub: string;          // Unique Google user ID
  name: string;
  email: string;
  picture?: string;     // Optional profile photo
  given_name?: string;  // Optional given name (first)
  family_name?: string; // Optional last name
  locale?: string;      // Optional language/region
}


// import type { AuthResponse } from '../types/auth';

// const API_URL = 'http://localhost:5000/api/auth'; // API base URL

// // Normal login function
// export const login = async (
//   username: string,
//   password: string,
//   role: string
// ): Promise<AuthResponse> => {
//   const response = await fetch(`${API_URL}/google`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ username, password, role }),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Login failed: ${errorText}`);
//   }

//   return response.json();
// };

// // Google login function
// export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
//   try {
//     // const response = await fetch(`${API_URL}/callback`, {
//     //   method: 'GET',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify({ idToken }),
//     // });
//     const response = await fetch(`${API_URL}/google?code=${encodeURIComponent(idToken)}`, {
// //const response = await fetch(`${API_URL}/google-callback?code=${idToken}`, {
//   method: 'POST',
//   headers: {
//     'Accept': 'application/json',
//   },
// });
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Google login failed: ${errorText}`);
//     }

//     return response.json();
//   } catch (error) {
//     console.error('Google login error:', error);
//     throw error; // re-throw so calling code can handle it
//   }
// };



import type { AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:5000/api/auth'; // ✅ Backend base URL

// ✅ Normal login with username/password/role
export const login = async (
  
  username: string,
  password: string,
  role: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }), // ✅ Proper payload
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${errorText}`);
  }

  return response.json(); // ✅ Should return AuthResponse (token, user info, etc.)
};

// ✅ Google login using ID token from Google OAuth
export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // ✅ Important for JSON body
        'Accept': 'application/json',
      },
      body: JSON.stringify({ idToken }), // ✅ Send in body, NOT query string
      
    });
console.log(idToken);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google login failed: ${errorText}`);
    }

    return response.json(); // ✅ Should return AuthResponse
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

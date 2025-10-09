import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./assets/global.css";

/* --------------------------------------------
   🔹 Root DOM element safety check
--------------------------------------------- */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element not found. Check index.html for <div id='root'></div>");
}

/* --------------------------------------------
   🔹 Google OAuth Client ID validation
--------------------------------------------- */
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!clientId) {
  console.warn("⚠️ Missing VITE_GOOGLE_CLIENT_ID in .env file — Google login will not work.");
}

/* --------------------------------------------
   🔹 React 18 createRoot
--------------------------------------------- */
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId || ""}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

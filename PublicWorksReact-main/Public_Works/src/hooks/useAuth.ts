import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (token && user?.roleName) {
        setIsAuthenticated(true);
        setUserRole(user.roleName); // dynamic role from backend
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isAuthenticated, userRole, loading };
}

import React, { type JSX } from "react";
import { Navigate } from 'react-router-dom';
import { getAuthRole, getAuthToken } from '../utils/auth';

interface PrivateRouteProps {
  children: JSX.Element;
  role: 'admin' | 'user';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const token = getAuthToken();
  const storedRole = getAuthRole();

  if (!token || storedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

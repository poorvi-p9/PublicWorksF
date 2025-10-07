export const setAuthData = (token: string, role: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

export const getAuthToken = () => localStorage.getItem('token');
export const getAuthRole = () => {
  const user = JSON.parse(localStorage.getItem('user')|| "0");
  return user.roleId;
};
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

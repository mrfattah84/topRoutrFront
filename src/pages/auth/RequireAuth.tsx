import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  ///unstring token for working auth
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default RequireAuth;

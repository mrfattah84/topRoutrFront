import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  console.log(token);

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default RequireAuth;

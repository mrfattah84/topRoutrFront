import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import "./app.css";
import RequireAuth from "./pages/auth/RequireAuth";

function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<RegisterPage />} />

      {/* protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Homepage />} />
      </Route>
    </Routes>
  );
}

export default App;

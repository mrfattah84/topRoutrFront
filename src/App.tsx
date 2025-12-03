import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MapPage from "./pages/MapPage";
import RegisterPage from "./pages/RegisterPage";
import "./app.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/home" element={<MapPage />} />
        <Route path="/map" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

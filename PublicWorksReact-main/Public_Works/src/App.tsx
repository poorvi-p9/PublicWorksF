import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";;
import IssuePage from "./pages/IssuePage";
import MainLayout from "./layouts/MainLayout"; // Make sure this exists

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes (nested under layout) */}
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-issue" element={<IssuePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
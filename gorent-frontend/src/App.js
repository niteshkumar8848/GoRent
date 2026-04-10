import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/Toast";
import ConfirmDialogProvider from "./components/ConfirmDialog";
import ThemeProvider from "./components/ThemeProvider";
import { connectSocket, disconnectSocket } from "./utils/socket";
import { getStoredToken } from "./utils/authStorage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Bookings from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function App() {
  useEffect(() => {
    const syncSocketAuth = () => {
      const token = getStoredToken();
      if (!token) {
        disconnectSocket();
        return;
      }
      connectSocket(token);
    };

    syncSocketAuth();
    window.addEventListener("auth-changed", syncSocketAuth);
    window.addEventListener("storage", syncSocketAuth);

    return () => {
      window.removeEventListener("auth-changed", syncSocketAuth);
      window.removeEventListener("storage", syncSocketAuth);
      disconnectSocket();
    };
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <BrowserRouter>
            <div className="app-shell">
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <Bookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ConfirmDialogProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

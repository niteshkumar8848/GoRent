import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider, { useToast } from "./components/Toast";
import ConfirmDialogProvider from "./components/ConfirmDialog";
import ThemeProvider from "./components/ThemeProvider";
import { connectSocket, disconnectSocket, getSocket } from "./utils/socket";
import { getStoredToken, getStoredUser } from "./utils/authStorage";
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

const BOOKING_EVENTS = [
  "booking:created",
  "booking:status_updated",
  "booking:cancelled",
  "booking:payment_submitted",
  "booking:payment_verified",
  "booking:deleted"
];

const getSocketNotification = (eventName, payload, role) => {
  const isAdmin = role === "admin";
  const bookingId = payload?.bookingId || payload?.booking_id || "";
  const shortBookingId = bookingId ? String(bookingId).slice(-6).toUpperCase() : "";
  const bookingTag = shortBookingId ? ` (#${shortBookingId})` : "";

  if (eventName === "booking:created") {
    return {
      title: "Booking Update",
      message: isAdmin
        ? `A new booking was created${bookingTag}.`
        : `Your booking was created successfully${bookingTag}.`,
      type: "success"
    };
  }

  if (eventName === "booking:status_updated") {
    const nextStatus = payload?.status || "updated";
    return {
      title: "Booking Status",
      message: isAdmin
        ? `Booking status changed to ${nextStatus}${bookingTag}.`
        : `Your booking status is now ${nextStatus}${bookingTag}.`,
      type: nextStatus === "cancelled" ? "warning" : "info"
    };
  }

  if (eventName === "booking:cancelled") {
    return {
      title: "Booking Cancelled",
      message: isAdmin
        ? `A booking was cancelled${bookingTag}.`
        : `Your booking has been cancelled${bookingTag}.`,
      type: "warning"
    };
  }

  if (eventName === "booking:payment_submitted") {
    const paymentMethod = payload?.paymentMethod ? String(payload.paymentMethod).replace("_", " ") : "payment";
    return {
      title: "Payment Update",
      message: isAdmin
        ? `Payment submitted via ${paymentMethod}${bookingTag}.`
        : `Payment submitted via ${paymentMethod}${bookingTag}.`,
      type: "info"
    };
  }

  if (eventName === "booking:payment_verified") {
    return {
      title: "Payment Confirmed",
      message: isAdmin
        ? `Payment has been verified${bookingTag}.`
        : `Your payment has been confirmed${bookingTag}.`,
      type: "success"
    };
  }

  if (eventName === "booking:deleted") {
    return {
      title: "Booking Removed",
      message: isAdmin
        ? `A booking was deleted${bookingTag}.`
        : `A booking entry was removed${bookingTag}.`,
      type: "warning"
    };
  }

  return null;
};

function AppShell() {
  const { addNotification } = useToast();
  const audioContextRef = useRef(null);
  const lastSoundAtRef = useRef(0);
  const notificationPermissionRequestedRef = useRef(false);

  const ensureNotificationPermission = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (notificationPermissionRequestedRef.current) return;
    notificationPermissionRequestedRef.current = true;
    Notification.requestPermission().catch(() => {});
  };

  const playNotificationSound = () => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    if (now - lastSoundAtRef.current < 900) return;
    lastSoundAtRef.current = now;

    try {
      const AudioContextRef = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextRef) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextRef();
      }

      const context = audioContextRef.current;
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.0001;
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      const startAt = context.currentTime;
      gainNode.gain.exponentialRampToValueAtTime(0.07, startAt + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.25);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.26);
    } catch (error) {
      // ignore device-specific audio restrictions
    }
  };

  const showDeviceNotification = (title, message, dedupeTag) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      const notification = new Notification(`GoRent - ${title || "Notification"}`, {
        body: message,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: dedupeTag || `gorent-${Date.now()}`
      });
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      // ignore notification popup failures
    }
  };

  useEffect(() => {
    const syncSocketAuth = () => {
      const token = getStoredToken();
      if (!token) {
        disconnectSocket();
        return;
      }
      connectSocket(token);
      ensureNotificationPermission();
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

  useEffect(() => {
    let detachHandlers = () => {};

    const bindNotificationHandlers = () => {
      detachHandlers();

      const token = getStoredToken();
      if (!token) return;

      const socket = connectSocket(token) || getSocket();
      if (!socket) return;

      const handlers = BOOKING_EVENTS.reduce((acc, eventName) => {
        acc[eventName] = (payload = {}) => {
          const role = getStoredUser()?.role || "user";
          const notification = getSocketNotification(eventName, payload, role);
          if (!notification) return;

          const dedupeKey = [
            eventName,
            payload?.bookingId || payload?.booking_id || "",
            payload?.timestamp || ""
          ].join(":");

          addNotification(notification.message, notification.type, {
            title: notification.title,
            showToast: true,
            duration: 5000,
            dedupeKey
          });

          const showSystemPopup = document.hidden || !document.hasFocus();
          if (showSystemPopup) {
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
              ensureNotificationPermission();
            }
            showDeviceNotification(notification.title, notification.message, dedupeKey);
          }

          playNotificationSound();
          if (showSystemPopup && typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([120, 80, 120]);
          }
        };
        return acc;
      }, {});

      BOOKING_EVENTS.forEach((eventName) => socket.on(eventName, handlers[eventName]));
      detachHandlers = () => {
        BOOKING_EVENTS.forEach((eventName) => socket.off(eventName, handlers[eventName]));
      };
    };

    bindNotificationHandlers();
    window.addEventListener("auth-changed", bindNotificationHandlers);
    window.addEventListener("storage", bindNotificationHandlers);

    return () => {
      window.removeEventListener("auth-changed", bindNotificationHandlers);
      window.removeEventListener("storage", bindNotificationHandlers);
      detachHandlers();
    };
  }, [addNotification]);

  return (
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

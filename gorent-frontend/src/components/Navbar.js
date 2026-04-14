import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { getStoredToken, getStoredUser } from "../utils/authStorage";
import { useToast } from "./Toast";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const notificationPanelRef = useRef(null);
  const token = getStoredToken();
  const user = getStoredUser();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications
  } = useToast();

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationPanelOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!notificationPanelOpen) return undefined;

    const onDocumentClick = (event) => {
      if (notificationPanelRef.current?.contains(event.target)) return;
      setNotificationPanelOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
    };
  }, [notificationPanelOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const visibleNotifications = useMemo(() => notifications.slice(0, 10), [notifications]);
  const formatNotificationTime = (createdAt) => {
    const parsedDate = new Date(createdAt);
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-top">
          <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.jpg" alt="GoRent" className="navbar-logo" />
          </Link>

          <button
            type="button"
            className={`navbar-menu-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
          <Link 
            to="/" 
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          
          {token && (
            <Link 
              to="/bookings" 
              className={`navbar-link ${isActive("/bookings") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
          )}
          
          {user?.role === "admin" && (
            <Link 
              to="/admin" 
              className={`navbar-link ${isActive("/admin") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          
          {token && user?.role !== "admin" && (
            <Link 
              to="/dashboard" 
              className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Dashboard
            </Link>
          )}
          
          <div className="navbar-user">
            {token ? (
              <>
                <div className="notification-wrapper" ref={notificationPanelRef}>
                  <button
                    type="button"
                    className={`notification-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                    onClick={() => setNotificationPanelOpen((prev) => !prev)}
                    aria-label="Toggle notifications"
                  >
                    <img
                      src="/notification.png"
                      alt="Notifications"
                      className="notification-icon"
                    />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                  </button>
                  {notificationPanelOpen && (
                    <div className="notification-panel">
                      <div className="notification-panel-header">
                        <h4>Notifications</h4>
                        <div className="notification-panel-actions">
                          <button type="button" onClick={markAllNotificationsRead}>Mark all read</button>
                          <button type="button" onClick={clearNotifications}>Clear</button>
                        </div>
                      </div>
                      {visibleNotifications.length > 0 ? (
                        <div className="notification-list">
                          {visibleNotifications.map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              className={`notification-item notification-item-${item.type} ${item.read ? "" : "unread"}`}
                              onClick={() => markNotificationRead(item.id)}
                            >
                              <p className="notification-item-title">{item.title || "Update"}</p>
                              <p className="notification-item-message">{item.message}</p>
                              <small className="notification-item-time">{formatNotificationTime(item.createdAt)}</small>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="notification-empty">No notifications yet.</p>
                      )}
                    </div>
                  )}
                </div>
                <span>Welcome, {user?.name || "User"}</span>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-outline btn-sm theme-toggle" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

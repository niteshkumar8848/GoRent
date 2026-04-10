const clearStoredAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    // ignore storage failures
  }
};

const isExpiredJwt = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = Number(payload?.exp);
    if (!Number.isFinite(exp)) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return exp <= nowInSeconds;
  } catch (error) {
    return true;
  }
};

export const getStoredToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (isExpiredJwt(token)) {
      clearStoredAuth();
      return null;
    }

    return token;
  } catch (error) {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

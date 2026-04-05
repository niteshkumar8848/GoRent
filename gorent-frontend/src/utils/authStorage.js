export const getStoredToken = () => {
  try {
    return localStorage.getItem("token");
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

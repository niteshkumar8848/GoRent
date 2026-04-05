import { io } from "socket.io-client";

let socketInstance = null;
let activeToken = null;

const getSocketBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, "");
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return `${window.location.protocol}//${window.location.host}`;
};

export const connectSocket = (token) => {
  if (!token) return null;

  if (socketInstance && activeToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  activeToken = token;
  socketInstance = io(getSocketBaseUrl(), {
    autoConnect: true,
    transports: ["websocket", "polling"],
    auth: { token }
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
  activeToken = null;
};

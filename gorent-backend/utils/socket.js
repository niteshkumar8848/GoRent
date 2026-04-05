let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

const emitToAdmins = (event, payload) => {
  if (!ioInstance) return;
  ioInstance.to("role:admin").emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${String(userId)}`).emit(event, payload);
};

const emitToAll = (event, payload) => {
  if (!ioInstance) return;
  ioInstance.emit(event, payload);
};

module.exports = {
  setIO,
  getIO,
  emitToAdmins,
  emitToUser,
  emitToAll
};

import { joinQueue, leaveQueue, createRoom, joinRoom, cancelRoom } from './matchmaking.js';
import { startMatch, handleAnswer, handleDisconnect, handleRejoin } from './engine.js';

export function registerBattleHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('battle:queue:join', async ({ mode }) => {
      if (!['mcq', 'typing'].includes(mode)) return socket.emit('battle:error', { code: 'INVALID_MODE' });
      const paired = joinQueue(socket, mode);
      if (paired) {
        const opponentSocket = io.sockets.sockets.get(paired.opponent.socketId);
        if (opponentSocket) await startMatch(socket, opponentSocket, mode, 'queue');
      }
    });

    socket.on('battle:queue:leave', () => leaveQueue(socket.id));

    socket.on('battle:room:create', ({ mode }) => {
      if (!['mcq', 'typing'].includes(mode)) return socket.emit('battle:error', { code: 'INVALID_MODE' });
      const code = createRoom(socket, mode);
      socket.emit('battle:room:created', { code });
    });

    socket.on('battle:room:join', async ({ code }) => {
      const result = joinRoom(socket, code);
      if (!result) return socket.emit('battle:error', { code: 'ROOM_NOT_FOUND' });
      const hostSocket = io.sockets.sockets.get(result.hostSocketId);
      if (!hostSocket) return socket.emit('battle:error', { code: 'HOST_DISCONNECTED' });
      await startMatch(hostSocket, socket, result.mode, 'invite');
    });

    socket.on('battle:answer', (payload) => handleAnswer(socket, payload));
    socket.on('battle:rejoin', (payload) => handleRejoin(socket, payload));

    socket.on('disconnect', () => {
      leaveQueue(socket.id);
      cancelRoom(socket.id);
      handleDisconnect(socket);
    });
  });
}

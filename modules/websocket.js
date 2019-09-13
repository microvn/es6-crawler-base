import $fn from '../modules/functions';
import * as authMiddle from './auth/middleware';

export default (io) => {
  // Authenticate for Socket;
  io.use(authMiddle.socketAuthorize());

  io.on('connect', function (socket) {
    console.log(socket.id);
    // Get Current usser socket.request.user
    socket.on('typing', async (data) => {
      console.log(data);
      socket.broadcast.emit('typingclient', 'SERVER', socket.request.user.username + ' has connected to this room');
    });
  });
};

import { io } from 'socket.io-client';

const URL = 'https://ceremony-savior-security.ngrok-free.dev';

export const socket = io(URL, {
  autoConnect: true,
  // If we had real auth, we'd pass tokens here
});

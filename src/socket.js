import { io } from "socket.io-client";

const socket = io("https://chatappbackend-3-jz0f.onrender.com", {
  autoConnect: false, // important
});

export default socket;





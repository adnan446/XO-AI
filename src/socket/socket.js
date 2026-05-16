import { io } from "socket.io-client";

// autoConnect: false — socket only connects when .connect() is called manually.
// This prevents dangling connections on pages that don't use multiplayer.
export const socket = io("http://localhost:5000", {
  autoConnect: false,
});

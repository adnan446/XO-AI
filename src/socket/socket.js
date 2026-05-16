import { io } from "socket.io-client";

// autoConnect: false — socket only connects when .connect() is called manually.
// This prevents dangling connections on pages that don't use multiplayer.


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export const socket = io(BACKEND_URL, {
  autoConnect: false,
});

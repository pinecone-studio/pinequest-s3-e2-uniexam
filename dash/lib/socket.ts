"use client";

import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });
  }
  return socket;
}

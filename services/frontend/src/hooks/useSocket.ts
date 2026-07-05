import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '../config';

type EventHandler = (...args: unknown[]) => void;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(config.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => { });
    socket.on('disconnect', () => { });

    socket.on('connect_error', () => { });

    for (const [event, handlers] of handlersRef.current.entries()) {
      for (const handler of handlers) {
        socket.on(event, handler as (...args: unknown[]) => void);
      }
    }

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const subscribe = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    if (socketRef.current?.connected) {
      socketRef.current.on(event, handler as (...args: unknown[]) => void);
    }

    return () => {
      handlersRef.current.get(event)?.delete(handler);
      socketRef.current?.off(event, handler as (...args: unknown[]) => void);
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketRef.current?.emit('monitor:subscribe', [room]);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    socketRef.current?.emit('monitor:unsubscribe', [room]);
  }, []);

  return { subscribe, joinRoom, leaveRoom, socket: socketRef };
}

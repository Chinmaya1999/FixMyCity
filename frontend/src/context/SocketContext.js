import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user && process.env.REACT_APP_SOCKET_URL) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        query: { userId: user.id }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('new-issue', (issue) => {
        toast.success(`New issue reported: ${issue.title}`);
      });

      newSocket.on('issue-updated', ({ issueId, status }) => {
        toast.success(`Issue #${issueId.slice(-4)} status updated to ${status}`);
      });

      newSocket.on('upvote-updated', ({ issueId, upvotes }) => {
        // Handle upvote update in UI
      });

      newSocket.on('new-comment', ({ issueId, comment }) => {
        toast.success(`New comment on issue #${issueId.slice(-4)}`);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinIssue = (issueId) => {
    if (socket) {
      socket.emit('join-issue', issueId);
    }
  };

  const leaveIssue = (issueId) => {
    if (socket) {
      socket.emit('leave-issue', issueId);
    }
  };

  const joinLocation = (location) => {
    if (socket) {
      socket.emit('join-location', location);
    }
  };

  const emitTyping = (issueId, isTyping) => {
    if (socket) {
      socket.emit('typing', { issueId, isTyping });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      joinIssue,
      leaveIssue,
      joinLocation,
      emitTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};
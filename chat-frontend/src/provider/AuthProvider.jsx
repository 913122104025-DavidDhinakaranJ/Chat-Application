import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // 🔥 Define connectSocket FIRST
  const connectSocket = useCallback((userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(serverUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers(userIds);
    });
  }, [socket]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    socket?.disconnect();
  }, [socket]);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/auth/check');
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        handleLogout();
      } else {
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  }, [connectSocket, handleLogout]);

  const login = async (state, credentials) => {
    try {
      const { data } = await axiosInstance.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        connectSocket(data.user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    handleLogout();
    toast.success('Logged out successfully');
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axiosInstance.put('/api/auth/update', body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token, checkAuth]);

  return (
    <AuthContext.Provider value={{
      authUser,
      onlineUsers,
      socket,
      login,
      logout,
      updateProfile,
      token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "../context/ChatContext";

export const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [Users, setUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket } = useContext(AuthContext);

  const getUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenCount);
      } else {
        toast.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axiosInstance.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error("Failed to fetch messages:", data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const sendMessage = async (message) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/messages/send/${selectedUser._id}`,
        message
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else {
        toast.error("Failed to send message:", data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axiosInstance.put(`/api/messages/seen/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        Users,
        setUsers,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

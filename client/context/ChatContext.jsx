import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [unSeenMessages, setUnSeenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  //   Function to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/message/users");
      if (data.success) {
        setUsers(data.users);
        setUnSeenMessages(data.unSeenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //   Function to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/message/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //   Function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/message/send/${selectUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //   Function to subscribe to messages for select user
  const subscribeToMessage = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectUser && newMessage.senderId === selectUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/message/mark/${newMessage._id}`);
      } else {
        setUnSeenMessages((prevUnSeenMessages) => ({
          ...prevUnSeenMessages,
          [newMessage.senderId]: prevUnSeenMessages[newMessage.senderId]
            ? prevUnSeenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Function to unsubscribe from messages
  const unsubscribeFromMessage = async () => {
    if (socket) socket.off("NewMessage");
  };

  useEffect(() => {
    subscribeToMessage();
    return () => unsubscribeFromMessage();
  }, [socket, selectUser]);

  const value = {
    messages,
    users,
    selectUser,
    unSeenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectUser,
    setUnSeenMessages,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

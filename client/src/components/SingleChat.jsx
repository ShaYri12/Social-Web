import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../context/ChatProvider";
import { makeRequest } from "../axios";

const ENDPOINT = "http://localhost:8800";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

    const fetchMessages = async () => {
      if (!selectedChat) return;
    
      try {
        setLoading(true);
    
        const response = await makeRequest.get(`/message/${selectedChat._id}`, {
          withCredentials: true, // Ensure credentials are included
        });
    
        const data = response.data;
        setMessages(data);
        setLoading(false);
    
        socket.emit("join chat", selectedChat._id);
      } catch (error) {
        console.log("Error Occured!", error);
      }
    };

    const sendMessage = async (event) => {
      if (event.key === "Enter" && newMessage) {
        socket.emit("stop typing", selectedChat._id);
        try {
          setNewMessage("");
          const response = await makeRequest.post(
            "/message",
            {
              content: newMessage,
              chatId: selectedChat._id, // Make sure to access the chat ID properly
            }
          );
          const data = response.data;
          socket.emit("new message", data);
          setMessages([...messages, data]);
        } catch (error) {
          console.error("Error occurred while sending message:", error);
          // Handle the error as needed, e.g., show a toast notification
        }
      }
    };
    

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
        <Text className="d-flex text-4xl p-4 w-100 rounded-lg justify-content-between align-items-center bg-light">
        <IconButton
          className="d-flex"
          style={{ display: 'flex' }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat("")}
        />
        {messages && (
          <>
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </>
        )}
      </Text>
      
          <Box className="d-flex flex-column justify-content-end p-4 bg-secondary w-100 h-100 overflow-hidden">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center w-100 h-100">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="messages">
              <ScrollableChat messages={messages} />
            </div>
          )}
        
          <FormControl onKeyDown={sendMessage} id="first-name" mt={3}>
            {istyping ? (
              <div className="d-flex justify-content-center align-items-center">
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginBottom: '15px', marginLeft: '0' }}
                />
              </div>
            ) : (
              <></>
            )}
            <Input
              type="text"
              variant="filled"
              className="form-control bg-light"
              placeholder="Enter a message.."
              value={newMessage}
              onChange={typingHandler}
            />
          </FormControl>
        </Box>
        
        </>
      ) : (
        // to get socket.io on same page
        <Box className="d-flex justify-center align-items-center h-100">
        <Text className="fs-3 mb-3">
          Hurry, Click on the Chat.
        </Text>
      </Box>

      )}
    </>
  );
};

export default SingleChat;

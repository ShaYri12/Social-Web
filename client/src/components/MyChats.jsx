import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender2 } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";

const MyChats = ({ fetchAgain, user }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();

  // const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          credentials: 'include', // Include credentials in the request
        },
      };
  
      const response = await fetch("http://localhost:8800/api/chat", config);
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
  
      const data = await response.json();
      setChats(data);
      console.log(data); // Log the fetched data directly
    } catch (error) {
      console.error("Error fetching chats:", error.message);
      // Update UI or take appropriate actions based on the error
    }
  };
  

  // const fetchChats = async () => {
  //   let userId = user._id;
  //   try {
  //     const config = {
  //       method: "POST",
  //       headers: {
  //         "Content-type": "application/json",
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //       body: JSON.stringify({ userId }),
  //     };
  //     const response = await fetch("http://localhost:5000/api/chat/", config);
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     const { data } = await response.json();
  //     setChats(data);
  //     console.log(chats);
  //   } catch (error) {
  //     console.log("Error Occurred!", error);
  //   }
  // };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      className="h-[400px] rounded-lg"
      d={{ base: selectedChat ? "none" : "fixed", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      m={6}
      w={{ base: "100%", md: "31%" }}
    >
      <Box className="flex p-4 text-[28px] w-full bg-[#F8F8F8] justify-between items-center">
        <Text className="text-[22px] font-semibold">My Chats</Text>

        <GroupChatModal>
          <Button className="flex text-[12px]" rightIcon={<AddIcon />}>
            Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box className="flex flex-col p-4 w-full h-full overflow-y-scroll bg-[#F8F8F8]">
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                className="cursor-pointer px-4 py-2 rounded-lg"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender2(loggedUser, chat.users)
                    : chat.chatName}
                </Text>

                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;

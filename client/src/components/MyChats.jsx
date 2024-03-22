import { useState, useEffect } from "react";
import { makeRequest } from '../axios';
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { getSender2 } from "../config/ChatLogics";

const MyChats = ({ fetchAgain, user }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async () => {
    try {
      const response = await makeRequest.get('/chat');
      console.log(response)
      if (response.status !== 200) {
        throw new Error('Failed to fetch chats');
      }
      const data = response.data;
      console.log("data: ",data)
      setChats(data);
      console.log("chats:", chats)
    } catch (error) {
      console.error('Error fetching chats:', error.message);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("user")));
    fetchChats();
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
        {chats.length ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                className="cursor-pointer px-4 py-2 rounded-lg"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                key={chat.id}
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

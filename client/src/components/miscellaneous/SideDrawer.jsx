import React from "react";
import {
  Box,
  Button,
  Input,
  Menu,
  MenuButton,
  Text,
  Tooltip,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/hooks";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../context/ChatProvider";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";

const SideDrawer = () => {
  const [search, setSearch] = React.useState("");
  const [searchResult, setSearchResult] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingChat, setLoadingChat] = React.useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setSelectedChat, user, chats, setChats, selectedChat } = ChatState();

  const handleSearch = async () => {
    if (!search) {
      alert("Please enter something in search");
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await fetch(
        `http://localhost:8800/api/user?search=${search}`,
        config
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      console.log("Error occurred:", error);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId }),
      };
      console.log(userId);
      const response = await fetch("http://localhost:8800/api/chat/", config);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      console.log(selectedChat);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      console.log("Error fetching the chat:", error);
    }
  };

  return (
    <div>
      <Box className="flex justify-between backdrop-blur-lg bg-white/60 items-center w-full p-4">
        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
          <Button onClick={onOpen}>Search Buddy.</Button>
        </Tooltip>
        <Text className="font-semibold text-xl">Chattinger..</Text>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box className="flex pb-2 gap-2 items-center">
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} className="my-4">
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner className="ml-auto flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SideDrawer;

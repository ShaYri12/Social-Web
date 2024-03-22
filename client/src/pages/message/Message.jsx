import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import Chatbox from "../../components/Chatbox";
import MyChats from "../../components/MyChats";
import SideDrawer from "../../components/miscellaneous/SideDrawer";
import { ChatState } from "../../context/ChatProvider";

const Message = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div className="w-screen h-screen bg-slate-300">
      {user && <SideDrawer className="w-full " />}

      <Box className="flex gap-4">
        {user && <MyChats user={user} />}
        {user && <Chatbox />}
      </Box>
    </div>
  );
};

export default Message;

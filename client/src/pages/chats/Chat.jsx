import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import Chatbox from "../../components/Chatbox";
import MyChats from "../../components/MyChats";
import SideDrawer from "../../components/miscellaneous/SideDrawer";
import { ChatState } from "../../context/ChatProvider";
import Navbar from "../../components/navbar/Navbar";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div className="w-100 h-100 bg-slate-300">
    <Navbar />
    {user && <SideDrawer className="w-100" />}
  
    <Box className="d-flex">
      {user && <MyChats user={user} />}
      {user && <Chatbox />}
    </Box>
  </div>
  
  );
};

export default Chatpage;

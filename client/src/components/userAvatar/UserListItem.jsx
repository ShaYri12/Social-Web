import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
// import { ChatState } from "../../Context/ChatProvider";

const UserListItem = ({ handleFunction, user }) => {
  return (
    <Box
      className="cursor-pointer bg-[#E8E8E8] w-full flex align-middle px-4 py-2 mb-2 rounded-lg text-black hover:text-white hover:bg-[#38B2AC]"
      onClick={handleFunction}
    >
      <Avatar
        className="mr-3 text-sm cursor-pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;

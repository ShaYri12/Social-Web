import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ChakraProvider } from "@chakra-ui/react";
import ChatProvider from "./context/ChatProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DarkModeContextProvider>
      <ChatProvider>
        <AuthContextProvider>
          <ChakraProvider>
            <ToastContainer
              position="top-center"
              autoClose={2000}
              pauseOnHover={true}
              closeOnClick={true}
              draggable={true}
            />
            <App />
          </ChakraProvider>
        </AuthContextProvider>
      </ChatProvider>
    </DarkModeContextProvider>
  </React.StrictMode>
);

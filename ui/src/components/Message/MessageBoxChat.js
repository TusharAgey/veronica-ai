import * as React from "react";
import Message from "./Message";
import Card from "../Card/Card";
import {
  Button,
  Flex,
  Icon,
  Img,
  Input,
  VStack,
  Box,
  useColorModeValue,
  Spacer,
} from "@chakra-ui/react";
export default function MessageBox(props) {
  // {
  //   from: "ai",
  //   content: "How can I help you?",
  // }
  const { messages } = props;
  return (
    <Flex
      overflow="auto"
      overflowY="auto"
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Card
        style={{ maxHeight: "60vh", background: "unset", overflowY: "auto" }}
        color="transparent"
        fontSize={{ base: "sm", md: "md" }}
        fontWeight="500"
      >
        {messages.map((message, idx) => (
          <Message id={idx} message={message}></Message>
        ))}
      </Card>
    </Flex>
  );
}

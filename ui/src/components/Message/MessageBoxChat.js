import * as React from "react";
import { Flex } from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import Message from "./Message";
import Card from "../Card/Card";

export const MessageBoxChat = (props) => {
  const messagesEndRef = useRef(null);
  const { messages, isLoading } = props;
  const loadingMessageContent = { isLoading, from: "ai", content: undefined };

  useEffect(() => {
    messagesEndRef.current.scrollIntoView();
  });
  return (
    <Flex ref={messagesEndRef} overflow="auto" overflowY="auto">
      <Card
        style={{ maxHeight: "60vh", background: "unset", overflowY: "auto" }}
        color="transparent"
        fontSize={{ base: "sm", md: "md" }}
        fontWeight="500"
        sx={{
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {[...messages, loadingMessageContent, "refForLatestScrollFocus"].map(
          (message, idx) => (
            <Message
              id={idx}
              message={message}
              idx={idx}
              messageRef={messagesEndRef}
            ></Message>
          )
        )}
      </Card>
    </Flex>
  );
};

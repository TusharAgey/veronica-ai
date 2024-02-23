"use client";
/*eslint-disable*/

import { MessageBoxChat } from "../../components/Message/MessageBoxChat";
import {
  Button,
  Flex,
  Icon,
  Img,
  Input,
  useColorModeValue,
  Spacer,
} from "@chakra-ui/react";
import { SendIcon } from "lucide-react";

import { useState } from "react";
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson } from "react-icons/md";
import Bg from "../../assets/img/bg-image.png";

export const Chat = (props) => {
  const [model, setModel] = useState("gpt-3.5-turbo");
  // Loading state
  const [loading, setLoading] = useState(false);
  // Conversation state
  const [messages, setMessages] = useState([
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
    {
      from: "ai",
      content: "How can I help you?",
    },
  ]);

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputColor = useColorModeValue("navy.700", "white");
  const iconColor = useColorModeValue("brand.500", "white");
  const bgIcon = useColorModeValue(
    "linear-gradient(180deg, #FBFBFF 0%, #CACAFF 100%)",
    "whiteAlpha.200"
  );
  const buttonBg = useColorModeValue("white", "whiteAlpha.100");
  const buttonShadow = useColorModeValue(
    "14px 27px 45px rgba(112, 144, 176, 0.2)",
    "none"
  );
  const textColor = useColorModeValue("navy.700", "white");
  const placeholderColor = useColorModeValue(
    { color: "gray.500" },
    { color: "whiteAlpha.600" }
  );
  const handleUserQuery = () => {
    setLoading(true);
    const userInput = document.getElementById("user-text-input").value;

    setMessages([
      ...messages,
      {
        from: "user",
        content: userInput,
      },
    ]);
  };

  return (
    <Flex
      w="100%"
      pt={{ base: "70px", md: "0px" }}
      direction="column"
      position="relative"
    >
      <Img
        src={Bg}
        position={"absolute"}
        w="350px"
        left="50%"
        top="50%"
        transform={"translate(-50%, -50%)"}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: "100%", md: "100%", xl: "100%" }}
        minH={{ base: "75vh", "2xl": "85vh" }}
        maxW="1000px"
      >
        {/* Model Change */}
        <Flex direction={"column"} w="100%">
          <Flex
            mx="auto"
            zIndex="2"
            w="max-content"
            mb="20px"
            borderRadius="60px"
          >
            <Flex
              cursor={"pointer"}
              transition="0.3s"
              justify={"center"}
              align="center"
              bg={model === "gpt-3.5-turbo" ? buttonBg : "transparent"}
              w="174px"
              h="70px"
              boxShadow={model === "gpt-3.5-turbo" ? buttonShadow : "none"}
              borderRadius="14px"
              color={textColor}
              fontSize="18px"
              fontWeight={"700"}
              onClick={() => setModel("gpt-3.5-turbo")}
            >
              <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg={bgIcon}
                me="10px"
                h="39px"
                w="39px"
              >
                <Icon
                  as={MdAutoAwesome}
                  width="20px"
                  height="20px"
                  color={iconColor}
                />
              </Flex>
              Code Bot
            </Flex>
            <Flex
              cursor={"pointer"}
              transition="0.3s"
              justify={"center"}
              align="center"
              bg={model === "gpt-4" ? buttonBg : "transparent"}
              w="164px"
              h="70px"
              boxShadow={model === "gpt-4" ? buttonShadow : "none"}
              borderRadius="14px"
              color={textColor}
              fontSize="18px"
              fontWeight={"700"}
              onClick={() => setModel("gpt-4")}
            >
              <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg={bgIcon}
                me="10px"
                h="39px"
                w="39px"
              >
                <Icon
                  as={MdBolt}
                  width="20px"
                  height="20px"
                  color={iconColor}
                />
              </Flex>
              Chat Bot
            </Flex>
          </Flex>
        </Flex>
        <MessageBoxChat messages={messages} />
        <Spacer />
        {/* Chat Input */}
        <Flex
          ms={{ base: "0px", xl: "60px" }}
          mt="20px"
          justifySelf={"flex-end"}
          _disabled={loading}
        >
          <Input
            disabled={loading}
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: "none" }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Type your message here..."
            id="user-text-input"
            onKeyDown={(event) => event.key === "Enter" && handleUserQuery()}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            h="54px"
            _hover={{
              boxShadow:
                "0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important",
              bg:
                "linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important",
              _disabled: {
                bg: "linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)",
              },
            }}
            onClick={handleUserQuery}
            isLoading={loading ? true : false}
          >
            <SendIcon height={20} />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

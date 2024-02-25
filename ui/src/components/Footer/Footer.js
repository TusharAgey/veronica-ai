/*eslint-disable*/
import { Flex, Link, Text } from "@chakra-ui/react";
import React from "react";

export default function Footer(props) {
  return (
    <Flex
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent="space-between"
      px="30px"
      pb="20px"
    >
      <Text
        color="gray.400"
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}
      >
        &copy; {1900 + new Date().getYear()},{" "}
        <Text as="span">
          {"Made with ❤️   by Tushar Agey based on the theme from "}
        </Text>
        <Link
          color="blue.400"
          href="https://www.creative-tim.com"
          target="_blank"
        >
          {"Creative Tim "}
        </Link>
        ,
        <Link color="blue.400" href="https://www.simmmple.com" target="_blank">
          {" Simmmple "}
        </Link>{" "}
        ,
        <Link
          color="blue.400"
          href="https://github.com/horizon-ui/chatgpt-ai-template/tree/main"
          target="_blank"
        >
          {" chatgpt-ai-template "}
        </Link>
        &
        <Link
          color="blue.400"
          href="https://github.com/NagariaHussain/doppio_bot/tree/main"
          target="_blank"
        >
          {" doppio_bot "}
        </Link>
        for a better web
      </Text>
    </Flex>
  );
}

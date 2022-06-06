import React from "react";
import { useState } from "react";

import { Button } from "@chakra-ui/react";
import { decryptPassword256Bit } from "utils";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
export const AccountDetails = (props) => {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <>
      <Button
        style={{ marginTop: "20px", float: "left", width: "20%" }}
        variant="solid"
        leftIcon={showPwd ? <ViewOffIcon /> : <ViewIcon />}
        color={props.colorMode === "dark" && "white"}
        _hover={props.colorMode === "dark" && "none"}
        onClick={() => setShowPwd(!showPwd)}
      />
      <label style={{ marginTop: "20px" }}>
        Name: {props.data.account_name}
      </label>
      <label>User Name: {props.data.username}</label>
      <label>Email: {props.data.email}</label>
      <label>UserName: {props.data.username}</label>
      <label>
        Password:{" "}
        {showPwd
          ? decryptPassword256Bit(props.data.password, props.sessionPassword)
          : "**********"}
      </label>
      <label>Description: {props.data.account_description}</label>
      <label>Creation Date: {props.data.creation_date}</label>
    </>
  );
};

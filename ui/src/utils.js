import { pwdManagerFields } from "./variables/const";
import { addAccount } from "./apiCalls";

import { SimpleCrypto } from "simple-crypto-js";

export const getGreetingByTime = () => {
  const date = new Date();
  let hours = date.getHours();
  return hours < 12
    ? "Morning"
    : hours <= 18 && hours >= 12
    ? "Afternoon"
    : "Evening";
};

export const encryptPassword256Bit = (requestBody) => {
  const key = requestBody["pwd-input-session-password"];
  return new SimpleCrypto(key).encrypt(requestBody["pwd-input-password"]);
};

export const decryptPassword256Bit = (password, key) => {
  try {
    return new SimpleCrypto(key).decrypt(password);
  } catch {
    console.log("wrror");
    return "ERROR";
  }
};

export const validateForm = (formData) => {
  return Object.values(formData).reduce((acc, elem) => acc && elem, true);
};

export const handleAddNewAccount = () => {
  const requestBody = pwdManagerFields.reduce((acc, elem) => {
    return {
      ...acc,
      ["pwd-input-" + elem.fieldIdentifier]: document.getElementById(
        "pwd-input-" + elem.fieldIdentifier
      ).value,
    };
  }, {});
  requestBody["pwd-input-password"] = encryptPassword256Bit(requestBody);
  requestBody["pwd-input-session-password"] = "none";
  // Insert into the DB!
  addAccount(requestBody);
  // Clear the input fields.
  pwdManagerFields.forEach(
    (elem) =>
      (document.getElementById("pwd-input-" + elem.fieldIdentifier).value = "")
  );
};

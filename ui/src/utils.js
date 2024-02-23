import { SimpleCrypto } from "simple-crypto-js";
import { pwdManagerFields } from "./variables/const";
import { addAccount, laodRandomFile } from "./apiCalls";

export const getRandomFile = () => {
  return laodRandomFile();
};

export const handleTextAreaKeyPress = (e, setInputText, inputText) => {
  if (e.key === "Backspace") {
    setInputText(inputText.slice(0, -1));
  } else if (e.key === "Enter") {
    setInputText(inputText + "\n");
  } else if (
    e.key !== "Shift" &&
    e.key !== "Control" &&
    e.key !== "Alt" &&
    e.key !== "CapsLock" &&
    e.key !== "Meta" &&
    e.key !== "Delete" &&
    !e.key.includes("Arrow")
  ) {
    setInputText(inputText + e.key);
  }
  e.preventDefault();
};

export const handleAddNewDiaryEntry = (inputText, setDownloadLinkVisible) => {
  const key = document.getElementById("pwd-input-session-password").value;
  const encryptionRequestBody = {
    "pwd-input-session-password": key,
    "pwd-input-password": inputText,
  };
  const encryptedData = encryptPassword256Bit(encryptionRequestBody);

  const textFileAsBlob = new Blob([encryptedData], { type: "text/plain" });

  const downloadLink = document.getElementById("save-file-href");
  downloadLink.download = new Date().toDateString() + ".txt"; //filename.extension
  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
  setDownloadLinkVisible(true);
};

export const handleBrowseDiary = () => {
  document.getElementById("file1").click();
  return true;
};

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
    console.log("error");
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

const migratePwd = () => {
  !currentAccounts.fetched &&
    !currentAccounts.isFetching &&
    getAllOldAccounts().then((res) => {
      const accounts = res.data.elems.reduce((acc, e) => [...acc, ...e], []);
      accounts.forEach((elem) =>
        getAccountDetails_old(elem)
          .then((data) => data.data)
          .then((e) => {
            const data = e.data;
            const payloadToSend = {
              "pwd-input-account-name": data[0],
              "pwd-input-user-name": data[1],
              "pwd-input-email-id": data[2],
              "pwd-input-password": encryptPassword256Bit({
                "pwd-input-session-password": "",
                "pwd-input-password": data[3],
              }),
              "pwd-input-account-description": data[4],
              "pwd-input-session-password": "none",
            };
            // addAccount(payloadToSend);
          })
      );
    });
};

const getAccInfo = () => {
  return passwords.map((e) => {
    return [
      e.filter((x) => x[0] === "account_name")[0][1],
      e.filter((x) => x[0] === "username")[0][1],
      e.filter((x) => x[0] === "email")[0][1],
      e.filter((x) => x[0] === "password")[0][1],
      e.filter((x) => x[0] === "account_description")[0][1],
    ];
  });
};

export const migratePwdFromFile = () => {
  const accountInformation = getAccInfo();
  accountInformation.forEach((accInfo) => {
    const data = accInfo;
    const payloadToSend = {
      "pwd-input-account-name": data[0],
      "pwd-input-user-name": data[1],
      "pwd-input-email-id": data[2],
      "pwd-input-password": encryptPassword256Bit({
        "pwd-input-session-password": "",
        "pwd-input-password": data[3],
      }),
      "pwd-input-account-description": data[4],
      "pwd-input-session-password": "none",
    };
    addAccount(payloadToSend);
  });
};

export const readText = (event, setInputText) => {
  const key = document.getElementById("pwd-input-session-password").value;
  const file = event.target.files.item(0);
  file.text().then((response) => {
    setInputText(decryptPassword256Bit(response, key));
  });
};

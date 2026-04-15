import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";
import { pwdManagerFields } from "./const";
import { addAccount, laodRandomFile } from "./apiCalls";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getGreetingByTime = () => {
  const date = new Date();
  let hours = date.getHours();
  return hours < 12
    ? "Morning"
    : hours <= 18 && hours >= 12
      ? "Afternoon"
      : "Evening";
};

export const getRandomFile = () => {
  return laodRandomFile();
};

export const handleTextAreaKeyPress = (
  e: any,
  setInputText: Function,
  inputText: string,
) => {
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

export const handleAddNewDiaryEntry = (
  inputText: string,
  setDownloadLinkVisible: Function,
) => {
  const key = (
    document.getElementById("pwd-input-session-password") as HTMLInputElement
  ).value;
  const encryptionRequestBody = {
    "pwd-input-session-password": key,
    "pwd-input-password": inputText,
  };
  const encryptedData = encryptPassword256Bit(encryptionRequestBody);

  const textFileAsBlob = new Blob([encryptedData], { type: "text/plain" });

  const downloadLink = document.getElementById(
    "save-file-href",
  ) as HTMLAnchorElement;
  downloadLink.download = new Date().toDateString() + ".txt"; //filename.extension
  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
  setDownloadLinkVisible(true);
};

export const handleBrowseDiary = () => {
  (document.getElementById("file1") as HTMLLinkElement).click();
  return true;
};

export const encryptPassword256Bit = (requestBody: any): string => {
  const key = requestBody["pwd-input-session-password"];
  return CryptoJS.AES.encrypt(
    key,
    requestBody["pwd-input-password"],
  ).toString();
};

export const decryptPassword256Bit = (
  ciphertext: string,
  key: string,
): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // If originalText is empty, decryption failed (wrong key)
    if (!originalText) throw new Error("Invalid Key");

    return originalText;
  } catch (err) {
    console.error("Decryption error:", err);
    return "ERROR";
  }
};

export const validateForm = (formData: any) => {
  return Object.values(formData).reduce((acc, elem) => acc && elem, true);
};

export const handleAddNewAccount = () => {
  const requestBody = pwdManagerFields.reduce((acc, elem) => {
    return {
      ...acc,
      ["pwd-input-" + elem.fieldIdentifier]: (
        document.getElementById(
          "pwd-input-" + elem.fieldIdentifier,
        ) as HTMLInputElement
      ).value,
    };
  }, {});
  //@ts-ignore
  requestBody["pwd-input-password"] = encryptPassword256Bit(requestBody);
  //@ts-ignore
  requestBody["pwd-input-session-password"] = "none";
  // Insert into the DB!
  addAccount(requestBody);
  // Clear the input fields.
  pwdManagerFields.forEach(
    (elem) =>
      ((
        document.getElementById(
          "pwd-input-" + elem.fieldIdentifier,
        ) as HTMLInputElement
      ).value = ""),
  );
};

export const readText = (
  event: React.ChangeEvent<HTMLInputElement>,
  setInputText: Function,
) => {
  const key = (
    document.getElementById("pwd-input-session-password") as HTMLInputElement
  ).value;
  const file = event.target.files?.item(0);
  file?.text().then((response: any) => {
    setInputText(decryptPassword256Bit(response, key));
  });
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { laodRandomFile } from "./apiCalls";

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

export const handleAddNewDiaryEntry = async (
  inputText: string,
  setDownloadLinkVisible: Function,
) => {
  const key = (
    document.getElementById("pwd-input-session-password") as HTMLInputElement
  ).value;

  const encryptedData = await encryptModern(inputText, key);

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

const dec = new TextDecoder();
const enc = new TextEncoder();

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      // @ts-ignore
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function decryptModern(
  payload: string,
  password: string,
): Promise<string> {
  try {
    const data: Uint8Array = fromBase64(payload);

    const salt: Uint8Array = data.slice(0, 16);
    const iv: Uint8Array = data.slice(16, 28);
    const ciphertext: Uint8Array = data.slice(28);

    const key: CryptoKey = await deriveKey(password, salt);

    const decrypted: ArrayBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        // @ts-ignore
        iv,
      },
      key,
      ciphertext,
    );

    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed", err);
    return "ERROR";
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export async function encryptModern(
  plaintext: string,
  password: string,
): Promise<string> {
  if (typeof plaintext !== "string") {
    throw new Error("encryptModern expects string plaintext");
  }

  const salt: Uint8Array = crypto.getRandomValues(new Uint8Array(16));
  const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(12));

  const key: CryptoKey = await deriveKey(password, salt);

  const encrypted: ArrayBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      // @ts-ignore
      iv,
    },
    key,
    enc.encode(plaintext),
  );

  const cipherBytes = new Uint8Array(encrypted);

  // pack: [salt | iv | ciphertext]
  const combined = new Uint8Array(salt.length + iv.length + cipherBytes.length);

  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(cipherBytes, salt.length + iv.length);

  return toBase64(combined);
}

export const handleAddNewAccount = async (createNewAccount: Function) => {
  const requestBody = {
    "pwd-input-account-name": (
      document.getElementById("account-name") as HTMLInputElement
    ).value as string,
    "pwd-input-user-name": (
      document.getElementById("user-name") as HTMLInputElement
    ).value as string,
    "pwd-input-email-id": (
      document.getElementById("email-id") as HTMLInputElement
    ).value as string,
    "pwd-input-account-description": (
      document.getElementById("account-description") as HTMLInputElement
    ).value as string,
    "pwd-input-password": (await encryptModern(
      (document.getElementById("password") as HTMLInputElement).value,
      (document.getElementById("session-password") as HTMLInputElement).value,
    )) as string, //Strictly kept at the end to ensure that all fields are accurately captured given the form gets cleared after this call and we wait for encryption.
    // If anything is read from the form after this line, it will be blank given the form gets cleared!
  };

  await createNewAccount(requestBody).unwrap();
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
    setInputText(decryptModern(response, key));
  });
};

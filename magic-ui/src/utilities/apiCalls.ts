import axios from "axios";
import type { AxiosResponse } from "axios";
import { LLAMA_SERVER_HOST_PORT, PYTHON_SERVER_HOST_PORT } from "./const";

export const laodRandomFile = () => {
  const files = ["treeTraversal.java"];
  const randomFile = files[Math.floor(Math.random() * files.length)];

  return axios.get(PYTHON_SERVER_HOST_PORT + "/" + randomFile);
};

export const loadLlamaModelDetails = () => {
  return axios.get(LLAMA_SERVER_HOST_PORT + "/models");
};

export const getKokoroAudio = async (
  textToSpeak: string,
): Promise<AxiosResponse<Blob>> => {
  return axios.post<Blob>(
    `${PYTHON_SERVER_HOST_PORT}/generate-tts`,
    {
      text: textToSpeak,
      voice: "af_heart",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob", // Tells Axios to handle the binary audio data correctly
    },
  );
};

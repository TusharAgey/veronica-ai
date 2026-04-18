import axios from "axios";
import { LLAMA_SERVER_HOST_PORT } from "./const";

export const laodRandomFile = () => {
  const files = ["treeTraversal.java"];
  const randomFile = files[Math.floor(Math.random() * files.length)];

  return axios.get("http://localhost:8080/" + randomFile);
};

export const loadLlamaModelDetails = () => {
  return axios.get(LLAMA_SERVER_HOST_PORT + "/models");
};

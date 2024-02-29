import { llama } from "./completion.js";

const clearUserInputBox = () => {
  document.getElementById("user-text-input").value = "";
  document.getElementById("user-text-input").focus();
};

const getPrompt = (query, allMessages) => {
  return query;
};

export const getChatBotResponseAndSetMessage = async (
  query,
  allMessages,
  setMessages,
  setLoading
) => {
  let data = "";
  const request = llama(getPrompt(query, allMessages));

  for await (const chunk of request) {
    data += chunk.data.content;
  }
  setMessages([
    ...allMessages,
    {
      from: "ai",
      content: data,
    },
  ]);
  setLoading(false);
  clearUserInputBox();
};

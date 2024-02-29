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
  setLoading,
  model,
  botsBackStory
) => {
  let data = "";
  const request = llama(
    getPrompt(query, allMessages),
    model,
    botsBackStory[model]
  );

  for await (const chunk of request) {
    data += chunk.data.content;
  }

  setMessages({
    ...allMessages,
    [model]: [
      ...allMessages[model],
      {
        from: "ai",
        content: data,
      },
    ],
  });
  setLoading(false);
  clearUserInputBox();
};

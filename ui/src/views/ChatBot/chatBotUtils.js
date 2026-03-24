import { llama } from "./completion.js";

const clearUserInputBox = () => {
  document.getElementById("user-text-input").value = "";
  document.getElementById("user-text-input").focus();
};

const getPrompt = (allMessages, model) => {
  // allMessages also contains the latest prompt from the current user.
  // User - Tushar
  // "This is a conversation between Tushar and Code-Bot, a friendly chatbot.
  // Code-Bot is helpful, kind, honest, good at writing software programs,
  // and never fails to answer any requests immediately and with precision.
  // Master of Javascript!\n\nUser: wow\ncode-bot:"

  const promptifiedMessages = allMessages[model].map((message) => {
    return {
      role: message.from === "user" ? "user" : "assistant",
      content: message.content,
    };
  });

  return promptifiedMessages;
};

export const getChatBotResponseAndSetMessage = async (
  allMessages,
  setMessages,
  setLoading,
  model,
  botsBackStory,
  setCurrentCompletionResponse
) => {
  let data = "";
  const request = llama(getPrompt(allMessages, model), botsBackStory[model]);

  for await (const chunk of request) {
    data += chunk;
    setCurrentCompletionResponse(data);
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
  setCurrentCompletionResponse(undefined);
};

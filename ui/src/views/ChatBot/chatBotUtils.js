import { getChatCompletionResponse } from "../../apiCalls";

const clearUserInputBox = () => {
  document.getElementById("user-text-input").value = "";
  document.getElementById("user-text-input").focus();
};

export const getChatBotResponseAndSetMessage = (
  query,
  allMessages,
  setMessages,
  setLoading
) => {
  getChatCompletionResponse(allMessages, query).then((data) => {
    setMessages(data);
    setLoading(false);
    clearUserInputBox();
  });
};

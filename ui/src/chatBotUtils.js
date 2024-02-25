export const getChatBotResponseAndSetMessage = (
  query,
  allMessages,
  setMessages,
  setLoading
) => {
  setTimeout(() => {
    setMessages([
      ...allMessages,
      {
        from: "ai",
        content: "ai:" + query,
      },
    ]);
    setLoading(false);
    document.getElementById("user-text-input").value = "";
    document.getElementById("user-text-input").focus();
  }, 200);
};

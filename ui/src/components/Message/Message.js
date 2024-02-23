import * as React from "react";

import MessageBubble from "./MessageBubble";
import MessageRenderer from "./MessageRenderer";
import MessageLoadingSkeletonText from "./MessageLoadingSkeletonText";

const Message = ({ message, idx, messageRef }) => {
  const fromAI = message.from === "ai";
  if (message === "refForLatestScrollFocus") {
    return <div ref={messageRef}></div>;
  }
  return (
    <MessageBubble key={idx} fromAI={fromAI}>
      {!message.isLoading ? (
        <MessageRenderer content={message.content} />
      ) : (
        <MessageLoadingSkeletonText />
      )}
    </MessageBubble>
  );
};

export default Message;

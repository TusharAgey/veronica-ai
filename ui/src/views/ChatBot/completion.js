// Reference - https://github.com/ggerganov/llama.cpp/blob/master/examples/server/public/completion.js
const paramDefaults = {
  stream: true,
  n_predict: 400,
  temperature: 0.7,
  repeat_last_n: 256,
  repeat_penalty: 1.18,
  top_k: 40,
  top_p: 0.5,
  min_p: 0.05,
  tfs_z: 1,
  typical_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  mirostat: 0,
  mirostat_tau: 5,
  mirostat_eta: 0.1,
  grammar: "",
  n_probs: 0,
  image_data: [],
  cache_prompt: false,
  slot_id: 0,
  max_tokens: 100,
};

// Logic to cut short the context window - basically, only work on the latest prompt OR summarize. <IMPORTANT>
function optimizePayload(messages) {
  const MAX_HISTORY = 10;
  const MAX_ASSISTANT_RESPONSE_LENGTH_IN_PAYLOAD = 150;
  const compress = (text) =>
    text
      .toLowerCase()
      .replace(/[`]/g, "")
      .replace(/[^\w\s.:/()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const shortenAssistant = (text) =>
    text.split("\n")[0].split(/[.,:\-]+/)[0].length >
    MAX_ASSISTANT_RESPONSE_LENGTH_IN_PAYLOAD
      ? text
          .split("\n")[0]
          .split(/[.,:\-]+/)[0]
          .substring(0, MAX_ASSISTANT_RESPONSE_LENGTH_IN_PAYLOAD)
      : text.split("\n")[0].split(/[.,:\-]+/)[0]; // First fragment or only first 150 charaters.

  const nonSystem = messages.filter((m) => m.role !== "system");

  // keep last few messages only
  const recent = nonSystem.slice(-MAX_HISTORY);

  const optimized = [];

  for (let msg of recent) {
    let content = compress(msg.content);

    if (msg.role === "assistant") {
      content = shortenAssistant(content);
    }

    optimized.push({
      role: msg.role,
      content,
    });
  }

  return optimized;
}

export async function* llama(prompt, backstory, params = {}, config = {}) {
  let controller = config.controller;

  if (!controller) {
    controller = new AbortController();
  }

  const finalPrompt = [
    {
      role: "system",
      content: backstory,
    },
    ...optimizePayload(prompt),
  ];

  const completionParams = {
    ...paramDefaults,
    ...params,
    messages: finalPrompt,
  };
  const response = await fetch("http://127.0.0.1:6792/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify(completionParams),
    headers: {
      Connection: "keep-alive",
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    signal: controller.signal,
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let content = "";

  try {
    let cont = true;

    while (cont) {
      const result = await reader.read();
      if (result.done) {
        break;
      }

      const text = decoder.decode(result.value);

      // Split the text into lines
      let lines = text.split("\n");

      // Parse all sse events and add them to result
      for (const line of lines) {
        if (line === "") {
          continue;
        }
        // since we know this is llama.cpp, let's just decode the json in data
        if (result.value) {
          if (line === "data: [DONE]") {
            cont = false;
            break;
          }
          const chunk = JSON.parse(line.replace(/^data:\s/, ""));
          if (chunk.choices[0].delta.content != null) {
            content += chunk.choices[0].delta.content;
            yield chunk.choices[0].delta.content;
          }
        }
        if (result.error) {
          result.error = JSON.parse(result.error);
          console.error(`llama.cpp error: ${result.error.content}`);
        }
      }
    }
  } catch (e) {
    if (e.name !== "AbortError") {
      console.error("llama error: ", e);
    }
    throw e;
  } finally {
    controller.abort();
  }
  return content;
}

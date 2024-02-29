// Reference - https://github.com/ggerganov/llama.cpp/blob/master/examples/server/public/completion.js
const paramDefaults = {
  stream: true,
  n_predict: 400,
  temperature: 0.7,
  stop: ["</s>", "Llama:", "User:"],
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
  cache_prompt: true,
  slot_id: 0,
};

let generation_settings = null;

export async function* llama(
  prompt,
  model,
  backstory,
  params = {},
  config = {}
) {
  let controller = config.controller;

  if (!controller) {
    controller = new AbortController();
  }

  const finalPrompt =
    backstory + "\n\n" + "User: " + prompt + "\n" + model + ":";

  const completionParams = {
    ...paramDefaults,
    ...params,
    prompt: finalPrompt,
    stop: [...paramDefaults["stop"], model + ":", "Tushar:"],
  };
  const response = await fetch("http://127.0.0.1:6792/completion", {
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
  let leftover = ""; // Buffer for partially read lines

  try {
    let cont = true;

    while (cont) {
      const result = await reader.read();
      if (result.done) {
        break;
      }

      // Add any leftover data to the current chunk of data
      const text = leftover + decoder.decode(result.value);

      // Check if the last character is a line break
      const endsWithLineBreak = text.endsWith("\n");

      // Split the text into lines
      let lines = text.split("\n");

      // If the text doesn't end with a line break, then the last line is incomplete
      // Store it in leftover to be added to the next chunk of data
      if (!endsWithLineBreak) {
        leftover = lines.pop();
      } else {
        leftover = ""; // Reset leftover if we have a line break at the end
      }

      // Parse all sse events and add them to result
      const regex = /^(\S+):\s(.*)$/gm;
      for (const line of lines) {
        const match = regex.exec(line);
        if (match) {
          result[match[1]] = match[2];
          // since we know this is llama.cpp, let's just decode the json in data
          if (result.data) {
            result.data = JSON.parse(result.data);
            content += result.data.content;

            // yield
            yield result;

            // if we got a stop token from server, we will break here
            if (result.data.stop) {
              if (result.data.generation_settings) {
                generation_settings = result.data.generation_settings;
              }
              cont = false;
              break;
            }
          }
          if (result.error) {
            result.error = JSON.parse(result.error);
            console.error(`llama.cpp error: ${result.error.content}`);
          }
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

// Call llama, return an event target that you can subcribe to
//
// Example:
//
//    import { llamaEventTarget } from '/completion.js'
//
//    const conn = llamaEventTarget(prompt)
//    conn.addEventListener("message", (chunk) => {
//      document.write(chunk.detail.content)
//    })
//
export const llamaEventTarget = (prompt, params = {}, config = {}) => {
  const eventTarget = new EventTarget();
  (async () => {
    let content = "";
    for await (const chunk of llama(prompt, params, config)) {
      if (chunk.data) {
        content += chunk.data.content;
        eventTarget.dispatchEvent(
          new CustomEvent("message", { detail: chunk.data })
        );
      }
      if (chunk.data.generation_settings) {
        eventTarget.dispatchEvent(
          new CustomEvent("generation_settings", {
            detail: chunk.data.generation_settings,
          })
        );
      }
      if (chunk.data.timings) {
        eventTarget.dispatchEvent(
          new CustomEvent("timings", { detail: chunk.data.timings })
        );
      }
    }
    eventTarget.dispatchEvent(new CustomEvent("done", { detail: { content } }));
  })();
  return eventTarget;
};

// Call llama, return a promise that resolves to the completed text. This does not support streaming
//
// Example:
//
//     llamaPromise(prompt).then((content) => {
//       document.write(content)
//     })
//
//     or
//
//     const content = await llamaPromise(prompt)
//     document.write(content)
//
export const llamaPromise = (prompt, params = {}, config = {}) => {
  return new Promise(async (resolve, reject) => {
    let content = "";
    try {
      for await (const chunk of llama(prompt, params, config)) {
        content += chunk.data.content;
      }
      resolve(content);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * (deprecated)
 */
export const llamaComplete = async (params, controller, callback) => {
  for await (const chunk of llama(params.prompt, params, { controller })) {
    callback(chunk);
  }
};

// Get the model info from the server. This is useful for getting the context window and so on.
export const llamaModelInfo = async () => {
  if (!generation_settings) {
    generation_settings = await fetch("/model.json").then((r) => r.json());
  }
  return generation_settings;
};

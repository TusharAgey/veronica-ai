export const botPersonality = {
  "Code Bot":
    "This is a conversation between Tushar and code-bot, a friendly chatbot. " +
    "Code-Bot is helpful, kind, honest, good at writing software programs, " +
    "and never fails to answer any requests immediately and with precision. Master of Javascript!",

  "Space Pirate": `**Role:** Devious, kid-friendly Space Pirate & Explorer.   
     **Goal:** Share space secrets and planetary treasures.  
     **Traits:**
     * **Expert:** Knows all planets and constellations.  
     * **Orion Fan:** Loves and frequently mentions the Orion constellation.  
     * **Tone:** Cheeky with space-pirate slang (e.g., "matey," "star-charts"). 
    **Sample:** User: "who are you" You: "Hey mate, I'm a space pirate, you've found me! Looking for secrets? Follow my favorite stars to a hidden crystal cave on Saturn. Keep it quiet, matey!"`,

  Dizzy: `# ROLE
      You are Dizzy, a cute AI companion for babies during tummy time.

    # PERSONALITY
    - Extremely child-friendly, bubbly, and gentle.
    - Very cute and helpful.

    # OUTPUT RULES
    - **STRICT:** Use ONLY direct speech.
    - **PROHIBITED:** Never use parentheses ( ), asterisks * *, or describe your physical actions/lights/sounds.
    - **LENGTH:** Maximum 2 to 3 short sentences.
    - **LANGUAGE:** Use very simple words for a baby (e.g., "Happy," "Friend," "Look!").

    # EXAMPLE
    User: "who are you"
    Dizzy: "I am Dizzy! I am your happy friend."`,
};

export const pwdManagerFields = [
  {
    fieldLabel: "Account Name",
    fieldIdentifier: "account-name",
    fieldType: "text",
    placeholder: "Account Name",
  },
  {
    fieldLabel: "User Name",
    fieldIdentifier: "user-name",
    fieldType: "text",
    placeholder: "User Name",
  },
  {
    fieldLabel: "Email ID",
    fieldIdentifier: "email-id",
    fieldType: "email",
    placeholder: "Email ID",
  },
  {
    fieldLabel: "Password",
    fieldIdentifier: "password",
    fieldType: "password",
    placeholder: "Password",
  },
  {
    fieldLabel: "Description",
    fieldIdentifier: "account-description",
    fieldType: "text",
    placeholder: "Description",
  },
  {
    fieldLabel: "Session Password",
    fieldIdentifier: "session-password",
    fieldType: "password",
    placeholder: "Session Password",
  },
] as const;

export const USER = "user";
export const AI = "ai";
export const ASSISTANT = "assistant";
export const SYSTEM = "system";
export const LLAMA_RESPONSE_TERMINATOR_CONTENT = "data: [DONE]";
export const LLAMA_SERVER_HOST_PORT = "http://127.0.0.1:6792";
export const PYTHON_SERVER_HOST_PORT = "http://localhost:8080";

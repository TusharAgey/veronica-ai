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

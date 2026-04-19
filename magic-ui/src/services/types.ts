import { ASSISTANT, SYSTEM } from "../utilities/const";

export interface AccountDetails {
  account_description: string;
  account_name: string;
  creation_date: string;
  email: string;
  password: string;
  username: string;
}

export interface AccountDetailsRequestPayload {
  "pwd-input-account-name": string;
  "pwd-input-account-description": string;
  "pwd-input-user-name": string;
  "pwd-input-password": string;
  "pwd-input-email-id": string;
}

export interface AccountsState {
  accounts: string[];
  selectedAccount: string | null;
  accountDetails: AccountDetails | null;
  loading: boolean;
  error: string | null;
  accountDetailsMap: Record<string, AccountDetails>;
}

export type ChatRole = typeof ASSISTANT | typeof SYSTEM | "user";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LlamaConfig {
  controller?: AbortController;
}

export interface LlamaParams {
  stream?: boolean;
  n_predict?: number;
  temperature?: number;
  repeat_last_n?: number;
  repeat_penalty?: number;
  top_k?: number;
  top_p?: number;
  min_p?: number;
  tfs_z?: number;
  typical_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  grammar?: string;
  n_probs?: number;
  image_data?: unknown[];
  cache_prompt?: boolean;
  slot_id?: number;
  max_tokens?: number;
}

export interface LlamaChunk {
  choices: Array<{
    delta: {
      content?: string | null;
    };
  }>;
}

export interface ChatTurn {
  user: string;
  assistant: string;
}

export type ChatSessions = Record<string, ChatTurn[]>;

export interface ChatsState {
  sessions: ChatSessions;
  selectedChat: string;
}

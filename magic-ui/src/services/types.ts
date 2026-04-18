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

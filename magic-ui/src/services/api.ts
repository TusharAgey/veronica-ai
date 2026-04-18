import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PYTHON_SERVER_HOST_PORT } from "../utilities/const";
import type { AccountDetails, AccountDetailsRequestPayload } from "./types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: PYTHON_SERVER_HOST_PORT,
  }),
  tagTypes: ["Accounts"],

  endpoints: (builder) => ({
    // 1. Get accounts list
    getAccounts: builder.query<string[], void>({
      query: () => "/v2/password-manager/user/accounts",
      transformResponse: (response: { accounts: string[] }) =>
        response.accounts,
      providesTags: ["Accounts"],
    }),

    // 2. Get account details
    getAccountDetails: builder.query<AccountDetails, string>({
      query: (accountName) => ({
        url: "/v2/password-manager/user/" + accountName,
      }),
    }),

    // 3. Create new account
    createNewAccount: builder.mutation<void, AccountDetailsRequestPayload>({
      query: (newAccountDetails) => ({
        url: "/v2/password-manager/new",
        method: "POST",
        body: newAccountDetails,
      }),
      invalidatesTags: ["Accounts"],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountDetailsQuery,
  useCreateNewAccountMutation,
} = api;

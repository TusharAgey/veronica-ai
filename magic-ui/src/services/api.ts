import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LLAMA_SERVER_HOST_PORT,
  PYTHON_SERVER_HOST_PORT,
} from "../utilities/const";
import type {
  AccountDetails,
  AccountDetailsRequestPayload,
  LlamaModelResponse,
} from "./types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: PYTHON_SERVER_HOST_PORT,
  }),
  tagTypes: ["Accounts", "AccountDetails"],

  endpoints: (builder) => ({
    // 1. Get accounts list
    getAccounts: builder.query<string[], void>({
      query: () => "/v2/password-manager/user/accounts",
      transformResponse: (response: { accounts: string[] }) => {
        const accounts = response.accounts;
        accounts.sort();
        return accounts;
      }, // Sort accounts alphabetically before returning
      providesTags: ["Accounts"],
    }),

    // 2. Get account details
    getAccountDetails: builder.query<AccountDetails, string>({
      query: (accountName) => ({
        url: "/v2/password-manager/user/" + accountName,
      }),
      providesTags: ["AccountDetails"],
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

    // 4. Delete an account
    deleteAccount: builder.mutation<void, string>({
      query: (accountName) => ({
        url: `/v2/password-manager/${encodeURIComponent(accountName)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounts", "AccountDetails"],
    }),
  }),
});

export const llama = createApi({
  reducerPath: "llama",
  baseQuery: fetchBaseQuery({
    baseUrl: LLAMA_SERVER_HOST_PORT,
  }),

  endpoints: (builder) => ({
    // 1. Get active LLM modal name
    getActiveLLMModel: builder.query<LlamaModelResponse, void>({
      query: () => ({
        url: "/models",
      }),
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountDetailsQuery,
  useCreateNewAccountMutation,
  useDeleteAccountMutation,
} = api;

export const { useGetActiveLLMModelQuery } = llama;

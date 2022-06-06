const axios = require("axios");

export const getAccounts = () => {
  return axios.get("http://localhost:8080/password-manager/user/accounts");
};

export const addAccount = (request) => {
  return axios.post("http://localhost:8080/password-manager/new", request);
};

export const loadAccountDetails = (accountId) => {
  return axios.get("http://localhost:8080/password-manager/user/" + accountId);
};

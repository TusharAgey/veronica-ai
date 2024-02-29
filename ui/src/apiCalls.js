import axios from "axios";

export const getAccounts = () => {
  return axios.get("http://localhost:8080/password-manager/user/accounts");
};

export const addAccount = (request) => {
  return axios.post("http://localhost:8080/password-manager/new", request);
};

export const loadAccountDetails = (accountId) => {
  return axios.get("http://localhost:8080/password-manager/user/" + accountId);
};

export const laodRandomFile = () => {
  const files = ["treeTraversal.java"];
  const randomFile = files[Math.floor(Math.random() * files.length)];

  return axios.get("http://localhost:8080/" + randomFile);
};

// export const getAllOldAccounts = () => {
//   return axios.get("http://localhost:5000/get_all_accounts");
// };

// export const getAccountDetails_old = (acc) => {
//   return axios.get("http://localhost:5000/get_account_details?useracc=" + acc);
// };

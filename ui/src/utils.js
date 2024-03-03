import { SimpleCrypto } from "simple-crypto-js";
import { pwdManagerFields } from "./variables/const";
import { addAccount, laodRandomFile } from "./apiCalls";

export const getRandomFile = () => {
  return laodRandomFile();
};

export const handleTextAreaKeyPress = (e, setInputText, inputText) => {
  if (e.key === "Backspace") {
    setInputText(inputText.slice(0, -1));
  } else if (e.key === "Enter") {
    setInputText(inputText + "\n");
  } else if (
    e.key !== "Shift" &&
    e.key !== "Control" &&
    e.key !== "Alt" &&
    e.key !== "CapsLock" &&
    e.key !== "Meta" &&
    e.key !== "Delete" &&
    !e.key.includes("Arrow")
  ) {
    setInputText(inputText + e.key);
  }
  e.preventDefault();
};

export const handleAddNewDiaryEntry = (inputText, setDownloadLinkVisible) => {
  const key = document.getElementById("pwd-input-session-password").value;
  const encryptionRequestBody = {
    "pwd-input-session-password": key,
    "pwd-input-password": inputText,
  };
  const encryptedData = encryptPassword256Bit(encryptionRequestBody);

  const textFileAsBlob = new Blob([encryptedData], { type: "text/plain" });

  const downloadLink = document.getElementById("save-file-href");
  downloadLink.download = new Date().toDateString() + ".txt"; //filename.extension
  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
  setDownloadLinkVisible(true);
};

export const handleBrowseDiary = () => {
  document.getElementById("file1").click();
  return true;
};

export const getGreetingByTime = () => {
  const date = new Date();
  let hours = date.getHours();
  return hours < 12
    ? "Morning"
    : hours <= 18 && hours >= 12
    ? "Afternoon"
    : "Evening";
};

export const encryptPassword256Bit = (requestBody) => {
  const key = requestBody["pwd-input-session-password"];
  return new SimpleCrypto(key).encrypt(requestBody["pwd-input-password"]);
};

export const decryptPassword256Bit = (password, key) => {
  try {
    return new SimpleCrypto(key).decrypt(password);
  } catch {
    console.log("error");
    return "ERROR";
  }
};

export const validateForm = (formData) => {
  return Object.values(formData).reduce((acc, elem) => acc && elem, true);
};

export const handleAddNewAccount = () => {
  const requestBody = pwdManagerFields.reduce((acc, elem) => {
    return {
      ...acc,
      ["pwd-input-" + elem.fieldIdentifier]: document.getElementById(
        "pwd-input-" + elem.fieldIdentifier
      ).value,
    };
  }, {});
  requestBody["pwd-input-password"] = encryptPassword256Bit(requestBody);
  requestBody["pwd-input-session-password"] = "none";
  // Insert into the DB!
  addAccount(requestBody);
  // Clear the input fields.
  pwdManagerFields.forEach(
    (elem) =>
      (document.getElementById("pwd-input-" + elem.fieldIdentifier).value = "")
  );
};

const migratePwd = () => {
  !currentAccounts.fetched &&
    !currentAccounts.isFetching &&
    getAllOldAccounts().then((res) => {
      const accounts = res.data.elems.reduce((acc, e) => [...acc, ...e], []);
      accounts.forEach((elem) =>
        getAccountDetails_old(elem)
          .then((data) => data.data)
          .then((e) => {
            const data = e.data;
            const payloadToSend = {
              "pwd-input-account-name": data[0],
              "pwd-input-user-name": data[1],
              "pwd-input-email-id": data[2],
              "pwd-input-password": encryptPassword256Bit({
                "pwd-input-session-password": "",
                "pwd-input-password": data[3],
              }),
              "pwd-input-account-description": data[4],
              "pwd-input-session-password": "none",
            };
            // addAccount(payloadToSend);
          })
      );
    });
};

const getAccInfo = () => {
  return passwords.map((e) => {
    return [
      e.filter((x) => x[0] === "account_name")[0][1],
      e.filter((x) => x[0] === "username")[0][1],
      e.filter((x) => x[0] === "email")[0][1],
      e.filter((x) => x[0] === "password")[0][1],
      e.filter((x) => x[0] === "account_description")[0][1],
    ];
  });
};

export const migratePwdFromFile = () => {
  const accountInformation = getAccInfo();
  accountInformation.forEach((accInfo) => {
    const data = accInfo;
    const payloadToSend = {
      "pwd-input-account-name": data[0],
      "pwd-input-user-name": data[1],
      "pwd-input-email-id": data[2],
      "pwd-input-password": encryptPassword256Bit({
        "pwd-input-session-password": "",
        "pwd-input-password": data[3],
      }),
      "pwd-input-account-description": data[4],
      "pwd-input-session-password": "none",
    };
    addAccount(payloadToSend);
  });
};

export const readText = (event, setInputText) => {
  const key = document.getElementById("pwd-input-session-password").value;
  const file = event.target.files.item(0);
  file.text().then((response) => {
    setInputText(decryptPassword256Bit(response, key));
  });
};

const percent = (quantity, percent) => {
  return (quantity * percent) / 100;
};

const getTaxViaNewRegime = (amt) => {
  const taxableAmt = amt - 50000; //This is standard deduction
  const taxBuckets = taxableAmt / 300000;
  const lastBucket = taxBuckets - Math.floor(taxBuckets);
  const sureBuckets = Math.floor(taxBuckets);
  if (taxableAmt <= 700000) {
    return 0;
  }
  if (taxBuckets <= 5) {
    const taxBrackets = {
      1: 0,
      2: 5,
      3: 10,
      4: 15,
      5: 20,
      6: 30,
    };

    const applicableTax = [...Array(sureBuckets).keys()].reduce(
      (acc, bucketNo) => {
        const taxForThisBucket = taxBrackets[bucketNo + 1];
        return acc + percent(300000, taxForThisBucket);
      },
      0
    );

    return (
      applicableTax +
      percent(300000 * lastBucket, taxBrackets[sureBuckets + 1]) +
      percent(
        applicableTax +
          percent(300000 * lastBucket, taxBrackets[sureBuckets + 1]),
        4
      ) // 4% Health and Education CESS
    );
  }

  const allThirtyPercentIncome = taxableAmt - 1500000;
  const thirtyPercentTax = percent(allThirtyPercentIncome, 30);
  const taxUpto15L = 150000;
  return (
    thirtyPercentTax + taxUpto15L + percent(thirtyPercentTax + taxUpto15L, 4) // 4% Health and Education CESS
  );
};

export const getPensionCalc = () => {
  const normalPension = 2000 * 12;
  const afterCommutationPension = 1000 * 12;
  const commutationInHand = 300000;
  const corpusGrowthPercentage = 8;

  const data = {
    year: [],
    pensionNormal: [],
    pensionCommuted: [],
    taxNormal: [],
    taxCommuted: [],
    effectiveNormalCorpus: [],
    effectiveCommutedCorpus: [],
  };

  [...Array(20).keys()].forEach((year) => {
    const realPension = year < 15 ? afterCommutationPension : normalPension;
    data["year"].push(year);
    data["pensionNormal"].push(normalPension);
    data["pensionCommuted"].push(realPension);
    const corpusFromPreviousYear =
      year === 0 ? 0 : data["effectiveNormalCorpus"][year - 1];

    const corpusFromPreviousYearCommuted =
      year === 0
        ? commutationInHand
        : data["effectiveCommutedCorpus"][year - 1];

    const earningFromPreviousYear =
      year > 0
        ? percent(
            data["effectiveNormalCorpus"][year - 1],
            corpusGrowthPercentage
          )
        : 0;

    const earningFromPreviousYearCommuted =
      year > 0
        ? percent(
            data["effectiveCommutedCorpus"][year - 1],
            corpusGrowthPercentage
          )
        : 0;

    data["taxCommuted"].push(
      getTaxViaNewRegime(realPension + earningFromPreviousYearCommuted)
    );

    data["effectiveCommutedCorpus"].push(
      realPension +
        earningFromPreviousYearCommuted -
        getTaxViaNewRegime(realPension + earningFromPreviousYearCommuted) +
        corpusFromPreviousYearCommuted
    );

    data["taxNormal"].push(
      getTaxViaNewRegime(normalPension + earningFromPreviousYear)
    );

    data["effectiveNormalCorpus"].push(
      normalPension +
        earningFromPreviousYear -
        getTaxViaNewRegime(normalPension + earningFromPreviousYear) +
        corpusFromPreviousYear
    );
  });

  return data;
};

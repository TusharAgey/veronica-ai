import { useEffect, useState } from "react";
import { MagicCard } from "../ui/MagicCard";
import { GlassInput, GlassSelect } from "../ui/GlassInput";
import { Eye, EyeOff } from "lucide-react"; // Assuming you have lucide-react or similar for the eye icon
import { useGetAccountDetailsQuery, useGetAccountsQuery } from "@/services/api";
import { decryptModern } from "../../utilities/utils";

export function BrowsePassword() {
  const { data: accounts = [] } = useGetAccountsQuery();
  const [selectedAccount, setSelectedAccount] =
    useState<string>("Select account...");

  const { data: accountDetails } = useGetAccountDetailsQuery(selectedAccount, {
    skip: !selectedAccount || selectedAccount === "Select account...",
  });
  const [sessionPasword, setSessionPassword] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const [decryptedPassword, setDecryptedPassword] =
    useState<string>("***********");

  useEffect(() => {
    if (
      !isRevealed ||
      accountDetails == undefined ||
      accountDetails.password === undefined
    ) {
      setDecryptedPassword("***********");
      return;
    }
    setDecryptedPassword("Decrypting...");
    let active = true;

    decryptModern(accountDetails.password, sessionPasword).then((pass) => {
      if (active) {
        setDecryptedPassword(pass);
      }
    });

    return () => {
      active = false;
    };
  }, [isRevealed, accountDetails?.password]);
  const passwordShowButtonDisabled =
    !selectedAccount ||
    selectedAccount === "Select account..." ||
    sessionPasword.length != 16;
  return (
    <MagicCard className="p-8 flex-1">
      <h2 className="text-xl font-semibold text-white mb-6">Browse Password</h2>
      <div className="space-y-5">
        <GlassSelect
          value={selectedAccount}
          onChange={(e) => {
            setSelectedAccount(e.target.value);
          }}
        >
          <option className="bg-[#0f0f1a]">Select account...</option>
          {accounts.map((account, idx) => (
            <option key={`${account}-${idx}`} value={account}>
              {account}
            </option>
          ))}
        </GlassSelect>

        <GlassInput
          type="password"
          placeholder="Session Password"
          onChange={(e) => setSessionPassword(e.target.value)}
        />

        {/* Toggle Visibility Button */}
        <div className="flex justify-start">
          <button
            style={
              passwordShowButtonDisabled
                ? {
                    cursor: "not-allowed",
                    opacity: 0.1,
                  }
                : {}
            }
            disabled={passwordShowButtonDisabled}
            onClick={() => setIsRevealed(!isRevealed)}
            className="p-3 rounded-xl bg-white/10 border border-white/5 hover:bg-white/20 transition-all text-white"
          >
            {isRevealed ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Details List */}
        {accountDetails && (
          <div className="mt-6 space-y-2 text-white/90 font-light text-ms">
            <p>
              <span className="font-normal">Name:</span>{" "}
              {accountDetails.account_name}
            </p>
            <p>
              <span className="font-normal">User Name:</span>{" "}
              {accountDetails.username}
            </p>
            <p>
              <span className="font-normal">Email:</span> {accountDetails.email}
            </p>

            <p>
              <span className="font-normal">Password:</span> {decryptedPassword}
            </p>
            <p>
              <span className="font-normal">Description:</span>{" "}
              {accountDetails.account_description}
            </p>
            <p>
              <span className="font-normal">Creation Date:</span>{" "}
              {accountDetails.creation_date}
            </p>
          </div>
        )}
      </div>
    </MagicCard>
  );
}

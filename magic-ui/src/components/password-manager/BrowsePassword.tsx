import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react"; // Assuming you have lucide-react or similar for the eye icon
import { MagicCard } from "../ui/MagicCard";
import { GlassInput, GlassSelect } from "../ui/GlassInput";
import {
  useGetAccountDetailsQuery,
  useGetAccountsQuery,
  useDeleteAccountMutation,
} from "@/services/api";
import { decryptModern } from "../../utilities/utils";
import { useToast } from "../../context/ToastContext";

export function BrowsePassword() {
  const { data: accounts = [] } = useGetAccountsQuery();
  const [selectedAccount, setSelectedAccount] = useState("");

  const { currentData: accountDetails } = useGetAccountDetailsQuery(
    selectedAccount!,
    { skip: !selectedAccount },
  );
  const [sessionPasword, setSessionPassword] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [deleteAccount, { isError, isSuccess }] = useDeleteAccountMutation();
  const [decryptedPassword, setDecryptedPassword] =
    useState<string>("***********");

  const { error: errorToast, success: successToast } = useToast();

  useEffect(() => {
    if (isError) {
      errorToast("Failed to delete the account. Perhapse, the server is down");
    }
  }, [isError, errorToast]);

  useEffect(() => {
    if (isSuccess) {
      successToast("Succesfully Deleted the account!");
    }
  }, [isSuccess, successToast]);

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
          value={selectedAccount!}
          onChange={(e) => {
            setSelectedAccount(e.target.value);
          }}
        >
          <option className="bg-[#0f0f1a]" value="">
            Select account...
          </option>
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

        {/* Toggle Visibility Button — centered on mobile, inline on desktop */}
        <div className="flex justify-center md:justify-start">
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
            {selectedAccount !== "Select account..." && (
              <button
                disabled={selectedAccount === "Select account..."}
                onClick={() => {
                  const confirmed = window.confirm(
                    `Delete account "${selectedAccount}"?\n\nThis can be restored later.`,
                  );
                  if (confirmed) {
                    deleteAccount(selectedAccount!).then(() => {
                      setSelectedAccount("");
                    });
                  }
                }}
                className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </MagicCard>
  );
}

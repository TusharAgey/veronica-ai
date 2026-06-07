import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Copy } from "lucide-react"; // Assuming you have lucide-react or similar for the eye icon
import { motion, AnimatePresence } from "framer-motion";
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

        {/* Details List — Animated Reveal */}
        <AnimatePresence mode="wait">
          {accountDetails && (
            <motion.div
              key={selectedAccount}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-6 space-y-2 text-white/90 font-light text-ms overflow-hidden"
            >
              {[
                { label: "Name", value: accountDetails.account_name },
                { label: "User Name", value: accountDetails.username },
                { label: "Email", value: accountDetails.email },
                { label: "Password", value: decryptedPassword },
                {
                  label: "Description",
                  value: accountDetails.account_description,
                },
                { label: "Creation Date", value: accountDetails.creation_date },
              ].map((field, i) => (
                <motion.p
                  key={field.label}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <span className="font-normal">{field.label}:</span>{" "}
                  {field.value}
                  {field.label === "Password" && (
                    <button
                      style={
                        !isRevealed
                          ? {
                              cursor: "not-allowed",
                              opacity: 0.1,
                              marginLeft: "15px",
                            }
                          : { marginLeft: "15px" }
                      }
                      disabled={!isRevealed}
                      onClick={() => {
                        navigator.clipboard.writeText(decryptedPassword);
                        successToast("Password copied to clipboard!");
                      }}
                      className="p-1 rounded bg-white/10 border border-white/5 hover:bg-white/20 transition-all text-white"
                    >
                      <Copy />
                    </button>
                  )}
                </motion.p>
              ))}
              {selectedAccount !== "Select account..." && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
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
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MagicCard>
  );
}

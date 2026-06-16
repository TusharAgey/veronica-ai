import { useEffect } from "react";
import { AddAccountForm } from "./password-manager/AddAccountForm";
import { PasswordStats } from "./password-manager/PasswordStats";
import { BrowsePassword } from "./password-manager/BrowsePassword";
import { useGetAccountsQuery } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function PasswordManager() {
  const { data: accounts = [], isError } = useGetAccountsQuery();
  const { error: errorToast } = useToast();

  useEffect(() => {
    if (isError) {
      errorToast("Failed to fetch accounts. Perhapse, the server is down");
    }
  }, [isError, errorToast]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-10 gap-6 h-full pb-24 md:pb-0">
      {/* 50% Space (5 out of 10) */}
      <div className="md:col-span-5">
        <AddAccountForm />
      </div>

      {/* 20% Space (2 out of 10) — hidden on mobile, shown as inline badge */}
      <div className="hidden md:flex md:col-span-1 flex-col">
        <PasswordStats count={accounts.length} />
      </div>

      {/* Mobile stats badge (visible only on small screens) */}
      <div className="flex md:hidden items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3">
        <span className="text-2xl font-bold text-white">{accounts.length}</span>
        <span className="text-white/50 text-sm">Saved Passwords</span>
      </div>

      {/* 30% Space (The rest: 3 out of 10) */}
      <div className="md:col-span-4 flex flex-col">
        <BrowsePassword />
      </div>
    </div>
  );
}

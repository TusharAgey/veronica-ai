import { AddAccountForm } from "./password-manager/AddAccountForm";
import { PasswordStats } from "./password-manager/PasswordStats";
import { BrowsePassword } from "./password-manager/BrowsePassword";
import { useGetAccountsQuery } from "../services/api";

export default function PasswordManager() {
  const { data: accounts = [] } = useGetAccountsQuery();

  return (
    <div className="grid lg:grid-cols-10 gap-6 h-full">
      {/* 50% Space (5 out of 10) */}
      <div className="lg:col-span-5">
        <AddAccountForm />
      </div>

      {/* 20% Space (2 out of 10) */}
      <div className="lg:col-span-1 flex flex-col  ">
        <PasswordStats count={accounts.length} />
      </div>

      {/* 30% Space (The rest: 3 out of 10) */}
      <div className="lg:col-span-4 flex flex-col  ">
        <BrowsePassword />
      </div>
    </div>
  );
}

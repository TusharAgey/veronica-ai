import { AddAccountForm } from "./password-manager/AddAccountForm";
import { PasswordStats } from "./password-manager/PasswordStats";
import { BrowsePassword } from "./password-manager/BrowsePassword";

export default function PasswordManager() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Column (Spans 2 columns on large screens) */}
      <AddAccountForm />

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        <PasswordStats count={0} />
        <BrowsePassword />
      </div>
    </div>
  );
}

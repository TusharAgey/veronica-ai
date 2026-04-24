import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { MagicCard } from "../ui/MagicCard";
import { GlassInput } from "../ui/GlassInput";
import { pwdManagerFields } from "../../utilities/const";
import { handleAddNewAccount } from "../../utilities/utils";
import { useCreateNewAccountMutation } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export function AddAccountForm() {
  const [createNewAccount, { isError, isSuccess }] =
    useCreateNewAccountMutation();
  const { error: errorToast, success: successToast } = useToast();
  const [currentFormTarget, setCurrentFormTarget] =
    useState<HTMLFormElement | null>(null);

  useEffect(() => {
    if (isError) {
      errorToast("Failed to add a new account. Perhapse, the server is down");
    }
  }, [isError, errorToast]);

  useEffect(() => {
    if (isSuccess) {
      currentFormTarget?.reset();
      successToast("Succesfully added new account!");
      setCurrentFormTarget(null);
    }
  }, [isSuccess, successToast, currentFormTarget]);

  return (
    <MagicCard className="col-span-2 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-white">Add New Account</h2>
        <Lock className="text-white/20" size={32} />
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddNewAccount(createNewAccount);
          setCurrentFormTarget(e.currentTarget);
        }}
      >
        {pwdManagerFields.map(({ fieldIdentifier, fieldType, placeholder }) => (
          <GlassInput
            key={fieldIdentifier}
            id={fieldIdentifier}
            type={fieldType}
            placeholder={placeholder}
            required
          />
        ))}

        <button className="w-full py-4 mt-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
          Submit
        </button>
      </form>
    </MagicCard>
  );
}

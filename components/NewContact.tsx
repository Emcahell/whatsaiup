"use client";

import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";

export default function NewContactScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-on-surface-variant">
            <MaterialSymbol name="arrow_back" className="text-2xl" />
          </button>
          <h1 className="text-[24px] font-medium text-primary tracking-tight">
            New Contact
          </h1>
        </div>
        <button className="px-4 py-2 text-primary font-semibold text-lg hover:bg-primary/5 rounded-full transition-colors">
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-tr from-[#4f6354]/20 to-[#e1d8bf]/30" />
              <MaterialSymbol
                name="add_a_photo"
                className="text-4xl text-on-surface-variant relative z-10"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-on-primary rounded-full border-4 border-surface flex items-center justify-center shadow-md">
              <MaterialSymbol name="edit" className="text-xl" filled />
            </button>
          </div>
          <span className="text-sm font-medium text-on-surface-variant">
            Add Profile Photo
          </span>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <InputField label="First Name" placeholder="e.g. Alex" />
          <InputField label="Last Name" placeholder="e.g. Rivers" />
          <InputField
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            icon="call"
          />
          <InputField
            label="Email"
            placeholder="alex.rivers@example.com"
            icon="mail"
          />

          {/* Notes Section */}
          <div className="bg-surface-container-low p-5 rounded-[28px] space-y-3">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <MaterialSymbol name="notes" className="text-2xl" />
              <span className="font-semibold">Notes</span>
            </div>
            <textarea
              placeholder="Add a note..."
              className="w-full bg-transparent border-none focus:outline-none text-body-lg placeholder:text-outline-variant resize-none h-24"
            />
          </div>
        </div>

        {/* Discard Action */}
        <div className="py-8 flex justify-center">
          <button className="flex items-center gap-2 text-error font-semibold py-2 px-6 hover:bg-error/5 rounded-full transition-colors">
            <MaterialSymbol name="delete" className="text-2xl" />
            Discard Entry
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponente InputField ---
function InputField({
  label,
  placeholder,
  icon,
}: {
  label: string;
  placeholder: string;
  icon?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-label-md font-semibold px-2 text-on-surface-variant">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <MaterialSymbol
            name={icon}
            className="absolute left-4 text-on-surface-variant"
          />
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant ${icon ? "pl-12" : "px-5"}`}
        />
      </div>
    </div>
  );
}

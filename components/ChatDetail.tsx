"use client";

import { useRouter } from "next/navigation";
import { MaterialSymbol } from "./ui/MaterialSymbols";

export default function ChatDetailScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-surface-container">
        <button onClick={() => router.back()} className="p-1 -ml-2 text-on-surface-variant">
          <MaterialSymbol name="arrow_back" className="text-2xl" />
        </button>

        <div className="flex flex-1 items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            alt="Alex Rivers"
            className="w-10 h-10 rounded-full bg-surface-container-high"
          />
          <div>
            <h2 className="text-lg font-semibold leading-tight">Alex Rivers</h2>
            <p className="text-xs text-on-surface-variant">Online</p>
          </div>
        </div>

        <button className="p-2 -mr-2 text-on-surface-variant">
          <MaterialSymbol name="more_vert" className="text-2xl" />
        </button>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 flex flex-col">
        {/* Date Divider */}
        <div className="flex justify-center">
          <span className="px-4 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full">
            Today
          </span>
        </div>

        {/* Message: Incoming */}
        <div className="max-w-[85%] self-start space-y-1">
          <div className="bg-surface-container px-5 py-4 rounded-[24px] rounded-tl-sm text-body-lg">
            Hey! Are you still available for the design sync this afternoon?
          </div>
          <span className="text-[11px] text-on-surface-variant px-2">
            10:24 AM
          </span>
        </div>

        {/* Message: Outgoing */}
        <div className="max-w-[85%] self-end space-y-1 flex flex-col items-end">
          <div className="bg-secondary-container text-on-secondary-container px-5 py-4 rounded-[24px] rounded-tr-sm text-body-lg">
            Hi Alex! Yes, I've just finished the latest Material You components.
            Ready when you are.
          </div>
          <span className="text-[11px] text-on-surface-variant px-2">
            10:26 AM
          </span>
        </div>

        {/* Message: Incoming with Image */}
        <div className="max-w-[85%] self-start space-y-1">
          <div className="bg-surface-container p-2 rounded-[28px] rounded-tl-sm overflow-hidden">
            <img
              src="imagen_2.png"
              alt="Organic Campus Concept"
              className="w-full aspect-square object-cover rounded-[24px]"
            />
            <p className="px-3 py-4 text-body-lg">
              Take a look at the organic curves we're planning for the new
              campus.
            </p>
          </div>
          <span className="text-[11px] text-on-surface-variant px-2">
            10:28 AM
          </span>
        </div>
      </div>

      {/* Message Input Bar */}
      <div className="p-5 bg-surface pb-8">
        <div className="flex items-center gap-2 bg-surface-container-high h-16 px-4 rounded-full overflow-hidden">
          <button className="p-2 text-on-surface-variant shrink-0">
            <MaterialSymbol name="sentiment_satisfied" className="text-2xl" />
          </button>

          <input
            type="text"
            placeholder="Message"
            className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-body-lg placeholder:text-on-surface-variant"
          />

          <div className="flex items-center gap-1 shrink-0">
            <button className="p-2 text-on-surface-variant">
              <MaterialSymbol name="attach_file" className="text-2xl" />
            </button>
            <button className="p-2 text-on-surface-variant">
              <MaterialSymbol name="photo_camera" className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

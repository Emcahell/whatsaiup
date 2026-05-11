import { useState, useRef, useEffect } from "react";
import { MaterialSymbol } from "./MaterialSymbols";

interface ModelOption {
  id: string;
  name: string;
}

interface ModelSelectProps {
  value: string;
  options: ModelOption[];
  onChange: (value: string) => void;
}

export default function ModelSelect({ value, options, onChange }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-surface-container-lowest h-16 rounded-[16px] text-body-lg flex items-center border-b-2 border-transparent focus:border-primary transition-all pl-12 pr-12 cursor-pointer text-left"
      >
        <span className={selected ? "text-on-surface" : "text-outline-variant"}>
          {selected?.name || "Select model"}
        </span>
      </button>
      <MaterialSymbol
        name="smart_toy"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />
      <MaterialSymbol
        name={open ? "expand_less" : "expand_more"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />

      {open && (
        <>
          <div className="absolute inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-high rounded-2xl shadow-lg py-2 z-20 max-h-60 overflow-y-auto">
            {options.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => { onChange(model.id); setOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-left text-body-lg transition-colors hover:bg-surface-container ${
                  model.id === value
                    ? "text-primary font-semibold bg-primary/5"
                    : "text-on-surface"
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

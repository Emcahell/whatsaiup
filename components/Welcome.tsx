"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { MaterialSymbol } from "./ui/MaterialSymbols";
import Logo from "../public/logo.webp";

interface WelcomeScreenProps {
  onNameSubmit: (name: string) => void;
}

export default function WelcomeScreen({ onNameSubmit }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    setError("");
    onNameSubmit(trimmedName);
  };

  return (
    <main className="font-sans min-h-screen bg-surface px-[20px] flex flex-col items-center justify-between py-12 text-on-surface">
      <div className="relative w-64 h-64 mt-8">
        <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
          <div className="w-full h-full opacity-50 absolute rounded-full scale-110 -translate-y-4" />
          <div className="p-6 rounded-[28%] rotate-12 shadow-sm">
            <Image src={Logo} alt="Logo" width={220} height={220} />
          </div>
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#4f6354]/20 to-transparent" />
        </div>
      </div>

      <div className="text-center space-y-4 mt-8">
        <h1 className="text-[44px] leading-[52px] font-semibold tracking-tight text-primary">
          Bienvenido a Whatsaiup
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-[300px] mx-auto leading-relaxed">
          Conectate y chatea con tus inteligencias artificiales favoritas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 mt-10">
        <div className="space-y-2">
          <label className="text-label-md font-semibold px-2 text-on-surface-variant">
            ¿Cómo te llamas?
          </label>
          <div className="relative flex items-center mt-2">
            <MaterialSymbol
              name="person"
              className="absolute left-4 text-on-surface-variant"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Ingresa tu nombre"
              className="w-full bg-surface-container h-16 pl-12 pr-4 rounded-xl text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant"
            />
          </div>
          {error && (
            <p className="text-error text-label-md px-2 mt-1">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-on-primary h-16 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer my-4">
          Continuar
          <MaterialSymbol name="arrow_forward" className="text-xl" />
        </button>
      </form>

      <div className="w-full space-y-6 mt-auto">
        <p className="text-[12px] leading-5 text-center text-on-surface-variant px-4">
          Tu nombre solo se usara para mejorar la experiencia.
        </p>
      </div>
    </main>
  );
}

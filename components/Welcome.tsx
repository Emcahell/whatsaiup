import React from "react";
import { MaterialSymbol } from "../components/MaterialSymbols";

export default function WelcomeScreen() {
  return (
    <main className="font-sans min-h-screen bg-surface px-[20px] flex flex-col items-center justify-between py-12 text-on-surface">
      {/* Ilustración Superior */}
      <div className="relative w-64 h-64 mt-8">
        <div className="absolute inset-0 bg-surface-container rounded-full overflow-hidden flex items-center justify-center">
          {/* Círculo decorativo con el icono central */}
          <div className="w-full h-full bg-[#dbdad4] opacity-50 absolute rounded-full scale-110 -translate-y-4" />
          <div className="z-10 bg-primary p-6 rounded-[28%] rotate-12 shadow-sm">
            <MaterialSymbol
              name="forum"
              className="text-on-primary text-5xl !rotate-[-12deg]"
              filled
            />
          </div>
          {/* Elementos botánicos (simulados con formas o SVG) */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#4f6354]/20 to-transparent" />
        </div>
      </div>

      {/* Textos Principales */}
      <div className="text-center space-y-4 mt-8">
        <h1 className="text-[44px] leading-[52px] font-semibold tracking-tight text-primary">
          Bienvenido a Stitch
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-[300px] mx-auto leading-relaxed">
          Conectando hilos de conversación en un espacio tranquilo y seguro.
        </p>
      </div>

      {/* Formulario e Inputs */}
      <div className="w-full space-y-6 mt-10">
        <div className="space-y-2">
          <label className="text-label-md font-semibold px-2 text-on-surface-variant">
            ¿Cómo te llamas?
          </label>
          <div className="relative flex items-center">
            <MaterialSymbol
              name="person"
              className="absolute left-4 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              className="w-full bg-surface-container h-16 pl-12 pr-4 rounded-xl text-body-lg focus:outline-none border-b-2 border-transparent focus:border-primary transition-all placeholder:text-outline-variant"
            />
          </div>
        </div>

        {/* Chips de Características */}
        <div className="flex justify-center gap-2">
          <Chip icon="verified_user" label="Privado" />
          <Chip icon="eco" label="Sostenible" />
          <Chip icon="bolt" label="Rápido" />
        </div>
      </div>

      {/* Botón de Acción y Footer */}
      <div className="w-full space-y-6 mt-auto">
        <button className="w-full bg-primary text-on-primary h-16 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
          Continuar
          <MaterialSymbol name="arrow_forward" className="text-xl" />
        </button>

        <p className="text-[12px] leading-5 text-center text-on-surface-variant px-4">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="underline font-semibold">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="underline font-semibold">
            Política de Privacidad
          </a>
          .
        </p>

        {/* Indicadores de carrusel */}
        <div className="flex justify-center gap-2 pb-2">
          <div className="w-2 h-2 rounded-full bg-outline-variant opacity-40" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-outline-variant opacity-40" />
        </div>
      </div>
    </main>
  );
}

// --- Subcomponente Chip ---
function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full border border-outline-variant/20 shadow-sm">
      <MaterialSymbol name={icon} className="text-lg" />
      <span className="text-label-md font-semibold">{label}</span>
    </div>
  );
}

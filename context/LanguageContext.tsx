"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  translations: Record<string, string>;
  toggleLanguage: () => void;
}

const translationsData: Record<Language, Record<string, string>> = {
  en: {
    "whatsaiup": "Whatsaiup",
    "all_chats": "All chats",
    "unread": "Unread",
    "no_chats": "No AI models added yet",
    "no_unread_messages": "No unread messages",
    "no_search_results": "No results for \"{name}\"",
    "settings": "Settings",
    "dark_mode": "Dark Mode",
    "light_mode": "Light Mode",
    "language": "Language",
    "new_contact": "New Contact",
    "new_ai_model": "Add AI Model",
    "select_contact": "Select Contact",
    "edit_contact": "Edit Contact",
    "message": "Message",
    "search": "Search",
    "menu": "Menu",
    "back": "Back",
    "save": "Save",
    "saving": "Saving...",
    "delete": "Delete",
    "discard_entry": "Discard Entry",
    "delete_contact": "Delete Contact",
    "change_profile_photo": "Change Profile Photo",
    "add_profile_photo": "Add Profile Photo",
    "first_name": "First Name",
    "last_name": "Last Name",
    "phone_number": "Phone Number",
    "email": "Email",
    "notes": "Notes",
    "add_a_note": "Add a note...",
    "add_first_ai": "Add your first AI model",
    "view_contact": "View Contact",
    "online": "Online",
    "today": "Today",
    "yesterday": "Yesterday",
    "new_chat": "New Chat",
    "new_conversation": "Start a new conversation",
    "cancel": "Cancel",
    "welcome": "Welcome to Whatsaiup",
    "welcome_description": "Connect and chat with your favorite artificial intelligences.",
    "your_name": "What's your name?",
    "enter_name": "Enter your name",
    "continue": "Continue",
    "privacy_note": "Your name will only be used to improve your experience.",
    "name_required": "Please enter your name",
    "alias_name": "Alias Name",
    "alias_placeholder": "e.g. My Gemini, Work Assistant",
    "provider": "Provider",
    "api_key": "API Key",
    "api_key_placeholder": "Enter your API key",
    "api_key_required": "Please enter your API key",
    "api_key_security_note": "Your API key is stored locally and never sent to our servers.",
    "model": "Model",
    "error_saving_model": "Error saving model. Please try again.",
    "delete_confirm_message": "Are you sure you want to delete this AI model? This action cannot be undone.",
    "sending_message": "Sending...",
    "start_conversation": "Start a conversation",
    "images_not_supported": "This provider does not support image inputs",
    "type_message": "Type a message...",
    "default_instruction": "Keep responses brief and concise.",
    "instruction": "Instruction",
    "instruction_placeholder": "e.g. Keep responses brief and concise.",
  },
  es: {
    "whatsaiup": "Whatsaiup",
    "all_chats": "Todos los chats",
    "unread": "Sin leer",
    "no_chats": "Aún no has añadido modelos de IA",
    "no_unread_messages": "Sin mensajes no leídos",
    "no_search_results": "Sin resultados para \"{name}\"",
    "settings": "Configuración",
    "dark_mode": "Modo oscuro",
    "light_mode": "Modo claro",
    "language": "Idioma",
    "new_contact": "Nuevo contacto",
    "new_ai_model": "Añadir Modelo IA",
    "select_contact": "Seleccionar contacto",
    "edit_contact": "Editar contacto",
    "message": "Mensaje",
    "search": "Buscar",
    "menu": "Menú",
    "back": "Volver",
    "save": "Guardar",
    "saving": "Guardando...",
    "delete": "Eliminar",
    "discard_entry": "Descartar entrada",
    "delete_contact": "Eliminar contacto",
    "change_profile_photo": "Cambiar foto de perfil",
    "add_profile_photo": "Añadir foto de perfil",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "phone_number": "Número de teléfono",
    "email": "Correo electrónico",
    "notes": "Notas",
    "add_a_note": "Añadir una nota...",
    "add_first_ai": "Añade tu primer modelo de IA",
    "view_contact": "Ver contacto",
    "online": "En línea",
    "today": "Hoy",
    "yesterday": "Ayer",
    "new_chat": "Nuevo chat",
    "new_conversation": "Inicia una nueva conversación",
    "cancel": "Cancelar",
    "welcome": "Bienvenido a Whatsaiup",
    "welcome_description": "Conectate y chatea con tus inteligencias artificiales favoritas.",
    "your_name": "¿Cómo te llamas?",
    "enter_name": "Ingresa tu nombre",
    "continue": "Continuar",
    "privacy_note": "Tu nombre solo se usará para mejorar la experiencia.",
    "name_required": "Por favor ingresa tu nombre",
    "alias_name": "Nombre del alias",
    "alias_placeholder": "ej: Mi Gemini, Asistente de trabajo",
    "provider": "Proveedor",
    "api_key": "Clave API",
    "api_key_placeholder": "Ingresa tu clave API",
    "api_key_required": "Por favor ingresa tu clave API",
    "api_key_security_note": "Tu clave API se almacena localmente y nunca se envía a nuestros servidores.",
    "model": "Modelo",
    "error_saving_model": "Error al guardar el modelo. Intenta de nuevo.",
    "delete_confirm_message": "¿Estás seguro de que quieres eliminar este modelo de IA? Esta acción no se puede deshacer.",
    "sending_message": "Enviando...",
    "start_conversation": "Inicia una conversación",
    "images_not_supported": "Este proveedor no admite imágenes",
    "type_message": "Escribe un mensaje...",
    "default_instruction": "Mantén las respuestas breves y concisas.",
    "instruction": "Instrucción",
    "instruction_placeholder": "ej. Respuestas breves y concisas.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("whatsaiup_language") as Language | null;
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "es" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("whatsaiup_language", newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{ language, translations: translationsData[language], toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
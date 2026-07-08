// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const applyDocumentDirection = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "ar"],
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",

    // Lazy loading unspecified files in `ns` array
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    // Safe when using auto escaping framework like React, Vue, ...
    interpolation: { escapeValue: false },
  })
  .then(() => {
    applyDocumentDirection(i18n.language);
  });

// Runs on every switch
i18n.on("languageChanged", applyDocumentDirection);

export default i18n;

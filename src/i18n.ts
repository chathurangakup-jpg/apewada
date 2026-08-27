import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locals/en.json";
import si from "./locals/si.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: { translation: en },
    si: { translation: si },
  },
  lng:
    Localization.locale && Localization.locale.startsWith("si") ? "si" : "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

const LANGUAGE_KEY = "appLanguage";

(async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) {
      await i18n.changeLanguage(saved);
    }
  } catch (e) {
    // ignore
  }
})();

export default i18n;

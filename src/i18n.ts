import { createI18n } from "vue-i18n";
import { zh_CN, en_US } from "./langs";

export default createI18n({
  locale: window.navigator.language.replace("-", "_") ?? "zh_CN",
  fallbackLocale: "zh_CN",
  legacy: false,
  messages: {
    zh_CN,
    en_US,
  },
});

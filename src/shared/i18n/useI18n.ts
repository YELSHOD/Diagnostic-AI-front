import { useSettingsStore } from "@features/settings/store";
import { messages } from "./messages";

function getValue(source: unknown, path: string): string {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return path;
  }, source) as string;
}

export function useI18n() {
  const locale = useSettingsStore((s) => s.locale);
  const dictionary = messages[locale];

  return {
    locale,
    t: (path: string) => getValue(dictionary, path)
  };
}

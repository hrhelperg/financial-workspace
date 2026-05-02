import de from "./messages/de.json";
import en from "./messages/en.json";
import es from "./messages/es.json";
import fr from "./messages/fr.json";
import pt from "./messages/pt.json";
import ru from "./messages/ru.json";
import { defaultLocale, type Locale } from "./config";

type Messages = typeof en;
type Primitive = string | number | boolean | null | undefined;
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type PreviousDepth = [never, 0, 1, 2, 3, 4, 5, 6];
type DotNestedKeys<T, Depth extends number = 6> = [Depth] extends [never]
  ? never
  : T extends Primitive
    ? never
    : {
        [K in Extract<keyof T, string>]: T[K] extends Primitive
          ? K
          : `${K}.${DotNestedKeys<T[K], PreviousDepth[Depth]>}`;
      }[Extract<keyof T, string>];

export type MessageKey = DotNestedKeys<Messages>;
export type Translator = (key: MessageKey, values?: Record<string, string | number>) => string;

const dictionaries: Record<Locale, DeepPartial<Messages>> = {
  de,
  en,
  es,
  fr,
  pt,
  ru
};

function readPath(source: DeepPartial<Messages>, key: string): string | undefined {
  let current: unknown = source;

  for (const part of key.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(message: string, values?: Record<string, string | number>) {
  if (!values) {
    return message;
  }

  return message.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function createTranslator(locale: Locale): Translator {
  const dictionary = getDictionary(locale);
  const fallback = getDictionary(defaultLocale);

  return (key, values) => {
    const message = readPath(dictionary, key) ?? readPath(fallback, key) ?? key;
    return interpolate(message, values);
  };
}

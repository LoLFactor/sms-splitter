const NUMBERS = '0123456789';

// BASIC LATIN LETTERS
const LOWERCASE_ASCII = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_ASCII = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// REGIONAL LATIN LETTERS
const LOWERCASE_LATIN = 'èéùìòøåæßäöñüà';
const UPPERCASE_LATIN = 'ÇØÅÆÉÄÖÑÜ';

const GREEK = 'ΔΦΓΛΩΠΨΣΘΞ';
const SYMBOLS = '@£$¥_!"#¤%&\'()*+,-./:;<=>?¡¿';
const CONTROL = '\n\r ';

export const SIMPLE_ALPHABET =
  NUMBERS + LOWERCASE_ASCII + UPPERCASE_ASCII + LOWERCASE_LATIN + UPPERCASE_LATIN + GREEK + SYMBOLS + CONTROL;


export const EXTENDED_ALPHABET = '^{}\\[~]|€';

export const GSM7_ALPHABET = SIMPLE_ALPHABET + EXTENDED_ALPHABET;

export function isGSM7(message: string): boolean {
  for (let i = 0; i < message.length; i++) {
    if (GSM7_ALPHABET.indexOf(message.charAt(i)) < 0) {
      return false;
    }
  }

  return true;
}

export function isGSM7Extended(message: string): boolean {
  for (let i = 0; i < message.length; i++) {
    if (EXTENDED_ALPHABET.indexOf(message.charAt(i)) > -1) {
      return true;
    }
  }

  return false;
}

export function isMultipart(message: string): boolean {
  // We say 'characters', but it's more like 'spaces',
  // since extended characters are actually two characters, but the first part (the escape) is invisible
  let characters = 0;

  for (let index = 0; index < message.length; index++) {
    if (isGSM7Extended(message.substring(index, index + 1))) {
      characters += 2;
    } else {
      characters += 1;
    }
  }

  return characters > 160;
}

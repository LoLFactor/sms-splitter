import { randomInt } from 'crypto';

import { GSM7_ALPHABET } from '../src/encodings/gsm-7';

export function generateRandomGSM7String(alphabet = GSM7_ALPHABET, length: number): string {
  let result = '';

  for (let i = 0; i < length; i++) {
    const index = randomInt(alphabet.length);
    result += alphabet[index];
  }

  return result;
}

export const BASIC_ASCII = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Romanian diacritics are examples of UCS-2 compatible characters.
// By UCS-2, I mean characters outside the GSM-7 encoding, but not outside the BMP (Basic Multilingual Plane).
export const UCS2_EXAMPLE_CHARACTERS = 'ăîșțâĂÎȘȚÂ';

// BMP (Basic Multilingual Plane) characters; characters that despite
// forcing a Unicode encoding, don't necessarily require full UTF-16,
// since UCS-2 is essentially UTF-16, but without the possibility of
// encoding UTF-32 characters.
export const BMP_CHARACTERS = BASIC_ASCII + UCS2_EXAMPLE_CHARACTERS + ' ';

// UTF-32 characters. These have to stored in an array, since storing them in a string and
// iterating over them will return the high and low surrogates for each. To handle them
// individually, they have to be different strings, since they are all 2 UTF-16 characters long.
export const EMOJIS = ['😀', '😂', '💳', '🙏'];

export function generateRandomUCS2String(length: number): string {
  // Include at least one UCS-2 character, else we might generate a GSM-7 string
  let result = UCS2_EXAMPLE_CHARACTERS[randomInt(UCS2_EXAMPLE_CHARACTERS.length)];

  for (let i = 1; i < length; i++) {
    const index = randomInt(BMP_CHARACTERS.length);
    result += BMP_CHARACTERS[index];
  }

  return result;
}

export function getRandomEmoji(): string {
  return EMOJIS[randomInt(EMOJIS.length)];
}

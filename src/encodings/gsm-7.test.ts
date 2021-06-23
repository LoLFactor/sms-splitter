import { randomInt } from 'crypto';

import { generateRandomGSM7String } from '../../test/utils';
import { EXTENDED_ALPHABET, GSM7_ALPHABET, isGSM7, isGSM7Extended, isMultipart, SIMPLE_ALPHABET } from './gsm-7';

const RUNS = parseInt(process.env.TEST_RUNS as string, 10) || 100;

describe('isGSM7(message: string): boolean', () => {
  it('should return true if the content is all GSM-7', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      expect(isGSM7(generateRandomGSM7String(GSM7_ALPHABET, 100))).toBe(true);
    }
  });

  it('should return false if the content contains anything outside GSM-7 alphabet', () => {
    expect.assertions(5);

    // A Romanian character (is outside GSM-7); just run-of-the-mill UTF-16
    expect(isGSM7('Ș')).toBe(false);
    // A smiley; Technically one character, but outside UTF-16; representable with surrogates
    expect(isGSM7('😀')).toBe(false);
    // A national flag; two UTF-32 characters, might show up as such (RO) in your editor instead of one flag emoji
    expect(isGSM7('🇷🇴')).toBe(false);
    // Polar bear; 4 Unicode characters, 5 UTF-16 characters: Bear (UTF-32) + ZWJ (UTF-16) + Snow flake (UTF-16) + Variant selector (UTF-16)
    // Should show up as one Polar Bear emoji, but might show up as two + spaces
    expect(isGSM7('🐻‍❄️')).toBe(false);
    // Combination of characters
    expect(isGSM7('abcdefg Ș 0123456789 😀')).toBe(false);
  });
});

describe('isGSM7Extended(message: string): boolean', () => {
  it('should return false if the content is all GSM-7 simple', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      expect(isGSM7Extended(generateRandomGSM7String(SIMPLE_ALPHABET, 100))).toBe(false);
    }
  });

  it('should return true if the content contains any GSM-7 extended characters', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const index = randomInt(EXTENDED_ALPHABET.length);
      const message = generateRandomGSM7String(SIMPLE_ALPHABET, 100) + EXTENDED_ALPHABET[index];

      expect(isGSM7Extended(message)).toBe(true);
    }
  });
});

describe('isMultiPart(message:string): boolean (GSM-7)', () => {
  it('should return false if total characters are under 160 (all simple)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const length = randomInt(161);
      const message = generateRandomGSM7String(SIMPLE_ALPHABET, length);

      expect(isMultipart(message)).toBe(false);
    }
  });

  it('should return false if total characters are under 160 (all extended)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const length = randomInt(81); // extended characters take up twice as much space because they require the escape character
      const message = generateRandomGSM7String(SIMPLE_ALPHABET, length);

      expect(isMultipart(message)).toBe(false);
    }
  });

  it('should return false if total characters are under 160 (combined)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const extendedLength = randomInt(81);
      const simpleLength = randomInt(161 - extendedLength * 2);
      const message = generateRandomGSM7String(SIMPLE_ALPHABET, simpleLength) + generateRandomGSM7String(EXTENDED_ALPHABET, extendedLength);

      expect(isMultipart(message)).toBe(false);
    }
  });

  it('should return true if total characters are over 160', () => {
    expect.assertions(RUNS * 3);

    for (let i = 0; i < RUNS; i++) {
      // Only simple characters, but over 160
      expect(isMultipart(generateRandomGSM7String(SIMPLE_ALPHABET, randomInt(161, 200)))).toBe(true);
      // Only extended characters, but over 160 total
      expect(isMultipart(generateRandomGSM7String(EXTENDED_ALPHABET, randomInt(81, 100)))).toBe(true);
      // Free for all
      expect(isMultipart(generateRandomGSM7String(GSM7_ALPHABET, 161))).toBe(true);
    }
  });
});

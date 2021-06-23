import { randomInt } from 'crypto';

import { generateRandomGSM7String, generateRandomUCS2String, getRandomEmoji } from '../test/utils';
import { EXTENDED_ALPHABET, GSM7_ALPHABET, SIMPLE_ALPHABET } from './encodings/gsm-7';
import { ENCODING, isMultipart, split } from './index';

const RUNS = parseInt(process.env.TEST_RUNS as string, 10) || 100;

function unicodeSlice(message: string, from: number, upTo?: number): string {
  return Array.from(message).slice(from, upTo).join('');
}

describe('isMultiPart(message: string): boolean', () => {
  it('should work with GSM-7 messages', () => {
    expect.assertions(2);

    expect(isMultipart(generateRandomGSM7String(SIMPLE_ALPHABET, 160))).toBe(false);
    expect(isMultipart(generateRandomGSM7String(GSM7_ALPHABET, 161))).toBe(true);
  });

  it('should work with Unicode messages', () => {
    expect.assertions(2);

    expect(isMultipart(generateRandomUCS2String(70))).toBe(false);
    expect(isMultipart(generateRandomUCS2String(71))).toBe(true);
  });
});

describe('split(message: string): ISplitResult | null', () => {
  it('should return null when null or undefined', () => {
    expect.assertions(2);
    // @ts-ignore
    expect(split(null)).toBe(null);
    // @ts-ignore
    expect(split(undefined)).toBe(null);
  });

  it('should return null when provided something other than a string', () => {
    expect.assertions(3);
    // @ts-ignore
    expect(split(123)).toBe(null);
    // @ts-ignore
    expect(split({})).toBe(null);
    // @ts-ignore
    expect(split(() => true)).toBe(null);
  });

  it('should return null when provided an empty string', () => {
    expect.assertions(1);
    expect(split('')).toBe(null);
  });

  /*
   * GSM-7 TESTS
   */

  it('should not split messages up to 160 characters using only GMS-7 simple characters', () => {
    expect.assertions(RUNS * 5);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomGSM7String(SIMPLE_ALPHABET, randomInt(1, 161));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(false);
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0]).toBe(message);
    }
  });

  it('should not split messages up to 160 characters using only GMS-7 extended characters', () => {
    expect.assertions(RUNS * 5);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomGSM7String(EXTENDED_ALPHABET, randomInt(1, 81));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(true);
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0]).toBe(message);
    }
  });

  it('should split messages over 160 characters using only GMS-7 simple characters', () => {
    expect.assertions(RUNS * 6);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomGSM7String(SIMPLE_ALPHABET, randomInt(161, 200));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(false);
      expect(result.parts).toHaveLength(2);
      expect(result.parts[0]).toBe(message.substring(0, 153));
      expect(result.parts[1]).toBe(message.substring(153));
    }
  });

  it('should split messages over 160 characters using only GMS-7 extended characters', () => {
    expect.assertions(RUNS * 6);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomGSM7String(EXTENDED_ALPHABET, randomInt(81, 100));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(true);
      expect(result.parts).toHaveLength(2);
      // Here, we expect only 76 characters, because 153 / 2 = 76.5.
      // Technically, the last character could be the escape character, but that's not the split works.
      // The following character will be moved to the following part and we lose one space in the previous part.
      expect(result.parts[0]).toBe(message.substring(0, 76));
      expect(result.parts[1]).toBe(message.substring(76));
    }
  });

  it('should split messages over 160 characters using only GMS-7 characters (all)', () => {
    expect.assertions(RUNS * 3);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomGSM7String(GSM7_ALPHABET, randomInt(161, 200));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.parts.length).toBeGreaterThan(1);
    }
  });

  it('should correctly split GSM-7 messages with an edge case', () => {
    expect.assertions(RUNS * 6);

    for (let i = 0; i < RUNS; i++) {
      // We construct a message using 152 characters. This should be split into a part by itself.
      const firstPart = generateRandomGSM7String(SIMPLE_ALPHABET, 152);
      // We construct a second part made up of an extended character (up to 154 characters now)
      let secondPart = generateRandomGSM7String(EXTENDED_ALPHABET, 1);
      // And 7 more simple characters (up to 161 now, causing a split)
      secondPart += generateRandomGSM7String(SIMPLE_ALPHABET, 7);

      // We split the combined message
      const result = split(firstPart + secondPart);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(true);
      // We expect two parts
      expect(result.parts).toHaveLength(2);
      // The first of which should those 152 initial characters
      expect(result.parts[0]).toBe(firstPart);
      // And the second to be the extended character and the following 7 simple characters
      expect(result.parts[1]).toBe(secondPart);
      // This is because we shouldn't split extended characters into their components. (the escape character in the first part and the value part in the second part)
      // Truth be told, since we're returning normal strings, we couldn't have represented that using just strings anyway...
    }
  });

  it('should correctly split GSM-7 messages with multiple edge cases', () => {
    expect.assertions(RUNS * 7);

    for (let i = 0; i < RUNS; i++) {
      // Same as previous test, but with a third part
      const firstPart = generateRandomGSM7String(SIMPLE_ALPHABET, 152);
      let secondPart = generateRandomGSM7String(EXTENDED_ALPHABET, 1);
      secondPart += generateRandomGSM7String(SIMPLE_ALPHABET, 150); // 152 in the second part now
      const thirdPart = generateRandomGSM7String(EXTENDED_ALPHABET, 1); // Just enough to get us over 2 parts

      const result = split(firstPart + secondPart + thirdPart);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(true);
      expect(result.parts).toHaveLength(3);
      expect(result.parts[0]).toBe(firstPart);
      expect(result.parts[1]).toBe(secondPart);
      expect(result.parts[2]).toBe(thirdPart);
    }
  });

  it('should correctly split GSM-7 messages with more then two parts and one edge case', () => {
    expect.assertions(RUNS * 7);

    for (let i = 0; i < RUNS; i++) {
      // Same as previous test, but with one edge case and one normal case
      const firstPart = generateRandomGSM7String(SIMPLE_ALPHABET, 152);
      let secondPart = generateRandomGSM7String(EXTENDED_ALPHABET, 1);
      secondPart += generateRandomGSM7String(SIMPLE_ALPHABET, 151); // 153 in the second part now
      const thirdPart = generateRandomGSM7String(SIMPLE_ALPHABET, 1);

      const result = split(firstPart + secondPart + thirdPart);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('GSM-7');
      expect(result.extended).toBe(true);
      expect(result.parts).toHaveLength(3);
      expect(result.parts[0]).toBe(firstPart);
      expect(result.parts[1]).toBe(secondPart);
      expect(result.parts[2]).toBe(thirdPart);
    }
  });

  /*
   * END GSM-7 TESTS
   */


  /*
   * UNICODE TESTS
   */

  it('should not split messages up to 70 characters using only UCS-2', () => {
    expect.assertions(RUNS * 4);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomUCS2String(randomInt(1, 70));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UCS-2');
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0]).toBe(message);
    }
  });

  it('should not split messages up to 70 characters using only UTF-32', () => {
    expect.assertions(RUNS * 4);

    for (let i = 0; i < RUNS; i++) {
      const emojiCount = randomInt(1, 35); // More than 35 UTF-32 characters would mean more then 70 UTF-16 characters

      let message = '';
      for (let i = 0; i < emojiCount; i++) {
        message += getRandomEmoji();
      }

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0]).toBe(message);
    }
  });

  it('should not split messages up to 70 characters using a mix of Unicode characters', () => {
    expect.assertions(RUNS * 4);

    for (let i = 0; i < RUNS; i++) {
      const emojiCount = randomInt(1, 35); // More than 35 UTF-32 characters would mean more then 70 UTF-16 characters
      const ucsLength = randomInt(71 - emojiCount * 2);

      let message = '';
      for (let i = 0; i < emojiCount; i++) {
        message += getRandomEmoji();
      }
      message += generateRandomUCS2String(ucsLength);

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      expect(result.parts).toHaveLength(1);
      expect(result.parts[0]).toBe(message);
    }
  });

  it('should split messages over 70 characters using only UCS-2', () => {
    expect.assertions(RUNS * 5);

    for (let i = 0; i < RUNS; i++) {
      const message = generateRandomUCS2String(randomInt(71, 100));

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UCS-2');
      expect(result.parts).toHaveLength(2);
      expect(result.parts[0]).toBe(unicodeSlice(message, 0, 67));
      expect(result.parts[1]).toBe(unicodeSlice(message, 67));
    }
  });

  it('should split messages over 70 characters using only UTF-32', () => {
    expect.assertions(RUNS * 5);

    for (let i = 0; i < RUNS; i++) {
      const emojiCount = randomInt(36, 50);

      let message = '';
      for (let i = 0; i < emojiCount; i++) {
        message += getRandomEmoji();
      }

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      expect(result.parts).toHaveLength(2);
      // Here, we expect only 33 characters, because 67 / 2 = 33.5.
      // As in the case with GSM-7, we shouldn't break characters.
      // Splitting on surrogate pairs is not considered correct.
      expect(result.parts[0]).toBe(unicodeSlice(message, 0, 33));
      expect(result.parts[1]).toBe(unicodeSlice(message, 33));
    }
  });

  it('should split messages over 70 characters using a mix of Unicode characters', () => {
    expect.assertions(RUNS * 3);

    for (let i = 0; i < RUNS; i++) {
      const emojiCount = randomInt(1, 10);
      const ucsLength = randomInt(71, 100 - emojiCount * 2);

      let message = '';
      for (let i = 0; i < emojiCount; i++) {
        message += getRandomEmoji();
      }
      message += generateRandomUCS2String(ucsLength);

      const result = split(message);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      expect(result.parts.length).toBeGreaterThan(1);
    }
  });

  it('should correctly split Unicode messages with an edge case', () => {
    expect.assertions(RUNS * 5);

    for (let i = 0; i < RUNS; i++) {
      // We construct a message using 66 UCS-2 characters. This should be split into a part by itself.
      const firstPart = generateRandomUCS2String(66);
      // We construct a second part made up of an UTF-32 (up to 68 characters now)
      let secondPart = getRandomEmoji();
      // And 3 more UCS-2 characters (up to 71 now, causing a split)
      secondPart += generateRandomUCS2String(3);

      // We split the combined message
      const result = split(firstPart + secondPart);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      // We expect two parts
      expect(result.parts).toHaveLength(2);
      // The first of which should those 66 initial characters
      expect(result.parts[0]).toBe(firstPart);
      // And the second to be the UTF-32 character and the following 3 UCS-2 characters
      expect(result.parts[1]).toBe(secondPart);
      // This is because we shouldn't split UTF-32 characters into their components (surrogates).
      // Even more correct would be to honor character boundaries, but that's near impossible until
      // ECMA implements Intl.breakIterator.
    }
  });

  it('should correctly split Unicode messages with multiple edge cases', () => {
    expect.assertions(RUNS * 6);

    for (let i = 0; i < RUNS; i++) {
      // Same as previous test, but with a third part
      const firstPart = generateRandomUCS2String(66);
      let secondPart = getRandomEmoji();
      secondPart += generateRandomUCS2String(64); // 66 in the second part now
      let thirdPart = getRandomEmoji(); // Just enough to get us over 2 parts

      const result = split(firstPart + secondPart + thirdPart);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      expect(result.parts).toHaveLength(3);
      expect(result.parts[0]).toBe(firstPart);
      expect(result.parts[1]).toBe(secondPart);
      expect(result.parts[2]).toBe(thirdPart);
    }
  });

  it('should correctly split Unicode messages with more then two parts and one edge case', () => {
    expect.assertions(RUNS * 6);

    for (let i = 0; i < RUNS; i++) {
      // Same as previous test, but with one edge case and one normal case
      const firstPart = generateRandomUCS2String(66);
      let secondPart = getRandomEmoji();
      secondPart += generateRandomUCS2String(65); // 67 in the second part now
      let thirdPart = generateRandomUCS2String(1); // Just enough to get us over 2 parts

      const result = split(firstPart + secondPart + thirdPart);

      expect(result).toBeDefined();
      expect(result.encoding).toBe<ENCODING>('UTF-16');
      expect(result.parts).toHaveLength(3);
      expect(result.parts[0]).toBe(firstPart);
      expect(result.parts[1]).toBe(secondPart);
      expect(result.parts[2]).toBe(thirdPart);
    }
  });

  /*
   * END UNICODE TESTS
   */
});

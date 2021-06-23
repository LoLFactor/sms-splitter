import { randomInt } from 'crypto';

import { generateRandomUCS2String, getRandomEmoji } from '../../test/utils';
import { isMultipart } from './unicode';

const RUNS = parseInt(process.env.TEST_RUNS as string, 10) || 100;

describe('isMultiPart(character: string): boolean (Unicode)', () => {
  it('should return false for messages under 70 characters (UCS-2)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const length = randomInt(71);
      const message = generateRandomUCS2String(length);

      expect(isMultipart(message)).toBe(false);
    }
  });

  it('should return false for messages under 70 characters (UTF-16)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const emojiCount = randomInt(10);
      const length = randomInt(71 - emojiCount * 2);

      let message = generateRandomUCS2String(length);
      for (let j = 0; j < emojiCount; j++) {
        message += getRandomEmoji();
      }

      expect(isMultipart(message)).toBe(false);
    }
  });

  it('should return true for messages over 70 characters (UCS-2)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const length = randomInt(71, 100);
      const message = generateRandomUCS2String(length);

      expect(isMultipart(message)).toBe(true);
    }
  });

  it('should return true for messages over 70 characters (UTF-16)', () => {
    expect.assertions(RUNS);

    for (let i = 0; i < RUNS; i++) {
      const emojiCount = randomInt(10);
      const length = randomInt(71, 100);

      let message = '';
      for (let j = 0; j < emojiCount; j++) {
        message += getRandomEmoji();
      }
      message += generateRandomUCS2String(length);

      expect(isMultipart(message)).toBe(true);
    }
  });
});

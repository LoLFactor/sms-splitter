import { isGSM7, isGSM7Extended, isMultipart as isGSM7Multipart } from './encodings/gsm-7';
import { isMultipart as isUnicodeMultipart } from './encodings/unicode';

export declare type ENCODING = 'GSM-7' | 'UCS-2' | 'UTF-16';

export function isMultipart(message: string): boolean {
  if (isGSM7(message)) {
    return isGSM7Multipart(message);
  } else {
    return isUnicodeMultipart(message);
  }
}

interface ISplitResult {
  encoding: ENCODING;
  extended?: boolean;
  parts: string[];
}

class GSM7SplitResult implements ISplitResult {
  encoding: ENCODING;
  extended: boolean;
  parts: string[];

  constructor(extended: boolean, parts: string[]) {
    this.encoding = 'GSM-7';
    this.extended = extended;
    this.parts = parts;
  }
}

class UnicodeSplitResult implements ISplitResult {
  encoding: ENCODING;
  parts: string[];

  constructor(isUTF: boolean, parts: string[]) {
    this.encoding = isUTF ? 'UTF-16' : 'UCS-2';
    this.parts = parts;
  }
}

function splitGSM7(message: string): ISplitResult {
  // The resulting information
  let parts: string[] = [];
  let extended = false;

  // Part limit for each message
  const partLimit = isMultipart(message) ? 153 : 160;

  // Working part info
  let partContent = '';
  let partSize = 0;
  for (let index = 0; index < message.length; index++) {
    // If the current characters is an extended character it takes up two spaces
    const currentCharacter = message.substring(index, index + 1);
    const currentSize = isGSM7Extended(currentCharacter) ? 2 : 1;

    // If we encountered an extended character, mark the event
    if (currentSize == 2) {
      extended = true;
    }

    // If adding the current character to this part will increase its size beyond the limit
    if (partSize + currentSize > partLimit) {
      // Then add the part to the list of parts as-is and start fresh with a new part
      parts.push(partContent);
      partContent = currentCharacter;
      partSize = currentSize;
    } else {
      // Else just add the character to this part and update the info
      partContent += currentCharacter;
      partSize += currentSize;
    }
  }

  // Push whatever has been added up to the last position
  parts.push(partContent);

  return new GSM7SplitResult(extended, parts);
}

function splitUnicode(message: string): ISplitResult {
  // The resulting information
  let parts: string[] = [];
  let isUTF = false;

  // Part limit for each message
  const partLimit = isMultipart(message) ? 67 : 70;

  // Easiest way to split into Unicode code points
  const characters = Array.from(message);

  let partContent = '';
  for (let index = 0; index < characters.length; index++) {
    // If the current characters is an UTF-32 character, the encoding HAS to be UTF-16
    if (characters[index].length === 2) {
      isUTF = true;
    }

    // If adding the current character to this part will increase its size beyond the limit
    if (partContent.length + characters[index].length > partLimit) {
      // Then add the part to the list of parts as-is and start fresh with a new part
      parts.push(partContent);
      partContent = characters[index];
    } else {
      // Else just add the character to this part and update the info
      partContent += characters[index];
    }
  }

  // Push whatever has been added up to the last position
  parts.push(partContent);

  return new UnicodeSplitResult(isUTF, parts);
}

export function split(message: string): ISplitResult | null {
  if (message === null || message === undefined) {
    return null;
  }

  if (typeof message !== 'string') {
    return null;
  }

  if (message.length === 0) {
    return null;
  }

  if (isGSM7(message)) {
    return splitGSM7(message);
  } else {
    return splitUnicode(message);
  }
}

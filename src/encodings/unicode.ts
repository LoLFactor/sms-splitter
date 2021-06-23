export function isMultipart(message: string): boolean {
  // Since Javascript strings are already UTF-16, the number of characters
  // in the string will match exactly with the SMS encoding.
  return message.length > 70;
}

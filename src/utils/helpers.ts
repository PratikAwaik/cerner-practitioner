// https://sentry.io/answers/generate-random-string-characters-in-javascript/
export function createRandomString(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
}

export function secondsToDays(seconds: number) {
  return Number((seconds / 86400).toFixed(2));
}

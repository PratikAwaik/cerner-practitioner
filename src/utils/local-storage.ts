export const getLSValue = (key: string) => {
  const value = localStorage.getItem(key);
  if (value) return JSON.parse(value);
  else return null;
};

export const setLSValue = (key: string, value: unknown) =>
  localStorage.setItem(key, JSON.stringify(value));

export const deleteLSValue = (key: string) => localStorage.removeItem(key);

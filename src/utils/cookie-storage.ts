import Cookies from "js-cookie";

export const setCookie = (key: string, value: string, options = {}) => {
  return Cookies.set(key, value, {
    expires: 1,
    ...options,
  });
};

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const deleteCookie = (key: string) => {
  return Cookies.remove(key);
};

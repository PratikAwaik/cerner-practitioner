import { COOKIE_KEYS, LOCALSTORAGE_KEYS } from "@/utils/constants";
import { getCookie } from "@/utils/cookie-storage";
import { getLSValue } from "@/utils/local-storage";
import axios from "axios";

export const fhirApi = axios.create({
  baseURL: getLSValue(LOCALSTORAGE_KEYS.CURRENT_ISS),
  headers: {
    "Content-Type": "application/fhir+json",
  },
});

fhirApi.interceptors.request.use((config) => {
  const access_token = getCookie(COOKIE_KEYS.ACCESS_TOKEN);
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

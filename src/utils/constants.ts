export const REDIRECT_URI = `${import.meta.env.BASE_URL}/launch`;
export const CLIENT_ID = import.meta.env.VITE_CERNER_CLIENT_ID;

export const COOKIE_KEYS = {
  CODE_VERIFIER: "cerner_prac_code_verifier",
  STATE: "cerner_pac_state",
  ACCESS_TOKEN: "cerner_prac_access_token",
};

export const LOCALSTORAGE_KEYS = {
  CURRENT_ISS: "cerner_current_iss",
  NEED_PATIENT_BANNER: "cerner_need_patient_banner",
};

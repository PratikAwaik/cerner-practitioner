import { useEffect, useState } from "react";
import { COOKIE_KEYS, LOCALSTORAGE_KEYS } from "../utils/constants";
import { getCookie } from "../utils/cookie-storage";
import { getLSValue } from "../utils/local-storage";

export default function HomePage() {
  const token = getCookie(COOKIE_KEYS.ACCESS_TOKEN);
  const needPatientBanner = getLSValue(
    LOCALSTORAGE_KEYS.NEED_PATIENT_BANNER
  ) as boolean;
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!token) {
      setError("Token is expired. Please perform the launch again!");
    }
  }, [token]);

  console.log({ needPatientBanner });

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-3xl font-semibold">{error}</p>
      </div>
    );
  }

  return <div>App</div>;
}

import { useEffect, useState } from "react";
import { COOKIE_KEYS, LOCALSTORAGE_KEYS } from "../utils/constants";
import { getCookie } from "../utils/cookie-storage";
import { getLSValue } from "../utils/local-storage";
import { useGetPatient } from "@/services/patient/patient.data";
import { Spinner } from "@/components/ui/spinner";
import { PatientBanner } from "@/components/patient-banner";
import { VitalSigns } from "@/components/vital-signs";

export default function HomePage() {
  const token = getCookie(COOKIE_KEYS.ACCESS_TOKEN);
  const needPatientBanner = getLSValue(
    LOCALSTORAGE_KEYS.NEED_PATIENT_BANNER
  ) as boolean;
  const [error, setError] = useState<string | undefined>();

  const { patient, isLoading } = useGetPatient();

  useEffect(() => {
    if (!token) {
      setError("Token is expired. Please perform the launch again!");
    }
  }, [token]);

  useEffect(() => {
    if (needPatientBanner && !isLoading && !patient) {
      setError(
        "Patient not found. Please try the launch again or try selecting the patient again!"
      );
    }
  }, [isLoading, needPatientBanner, patient]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-3xl font-semibold">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center p-4">
      <div className="w-full flex flex-col gap-y-6">
        {!!needPatientBanner && <PatientBanner patient={patient!} />}
        <VitalSigns />
      </div>
    </div>
  );
}

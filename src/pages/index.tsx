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

  const { patient, isLoading, isError } = useGetPatient();

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

  if (error || isError) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <p className="text-3xl font-semibold">
          {error || "Something went wrong. Retry the launch flow!"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <Spinner className="h-10 w-10" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex items-start p-4">
      <div className="w-full flex flex-col gap-y-6 items-start">
        {!!needPatientBanner && <PatientBanner patient={patient!} />}
        <VitalSigns />
      </div>
    </div>
  );
}

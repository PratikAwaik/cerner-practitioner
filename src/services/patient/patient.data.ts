import { LOCALSTORAGE_KEYS } from "@/utils/constants";
import { getLSValue } from "@/utils/local-storage";
import { useQuery } from "@tanstack/react-query";
import { PatientService } from "./patient.service";

const svc = new PatientService();

export const useGetPatient = () => {
  const patient = getLSValue(LOCALSTORAGE_KEYS.CURRENT_PATIENT);
  const needPatientBanner = getLSValue(LOCALSTORAGE_KEYS.NEED_PATIENT_BANNER);

  const { data, ...rest } = useQuery({
    queryKey: ["patient", patient],
    queryFn: () => svc.getPatient(patient),
    enabled: !!patient && needPatientBanner,
  });

  return {
    patient: data?.data,
    ...rest,
  };
};

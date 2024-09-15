import { LOCALSTORAGE_KEYS } from "@/utils/constants";
import { getLSValue } from "@/utils/local-storage";
import { useQuery } from "@tanstack/react-query";
import { ObservationService } from "./observation.service";

const svc = new ObservationService();

export const useGetVitalSigns = () => {
  const patientId = getLSValue(LOCALSTORAGE_KEYS.CURRENT_PATIENT);

  const { data, ...rest } = useQuery({
    queryKey: ["observation", patientId],
    queryFn: () => svc.getVitalSigns(patientId),
    enabled: !!patientId,
  });

  return {
    observationData: data?.data,
    ...rest,
  };
};

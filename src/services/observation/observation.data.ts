import { LOCALSTORAGE_KEYS } from "@/utils/constants";
import { getLSValue } from "@/utils/local-storage";
import { UseMutationOptions, useQuery } from "@tanstack/react-query";
import { ObservationService } from "./observation.service";
import { useMutate } from "@/hooks/use-mutate";
import { Observation } from "fhir/r4";

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

export const useCreateVitalSign = (
  options: UseMutationOptions<unknown, Error, Partial<Observation>, unknown>
) => {
  const patientId = getLSValue(LOCALSTORAGE_KEYS.CURRENT_PATIENT);
  return useMutate(
    svc.createVitalSign,
    ["observation", patientId],
    "Vitals added successfully!",
    options
  );
};

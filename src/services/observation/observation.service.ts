import { fhirApi } from "@/lib/axios";
import { Bundle, Observation } from "fhir/r4";

export class ObservationService {
  async getVitalSigns(patientId: string) {
    return fhirApi.get<Bundle<Observation>>(`/Observation`, {
      params: {
        patient: patientId,
        category: "vital-signs",
        sort: "-date",
      },
    });
  }

  async createVitalSign(payload: Partial<Observation>) {
    return fhirApi.post("/Observation", payload, {
      headers: {
        Accept: "application/fhir+json",
      },
    });
  }
}

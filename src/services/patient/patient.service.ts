import { fhirApi } from "@/lib/axios";
import { Patient } from "fhir/r4";

export class PatientService {
  async getPatient(patientId: string) {
    return fhirApi.get<Patient>(`/Patient/${patientId}`);
  }
}

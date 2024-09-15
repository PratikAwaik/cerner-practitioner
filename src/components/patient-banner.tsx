import { Patient } from "fhir/r4";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";
import { format } from "date-fns";

interface PatientBannerProps {
  patient: Patient;
}

export const PatientBanner = ({ patient }: PatientBannerProps) => {
  const patientName = useMemo(() => {
    const names = patient?.name;
    if (names) {
      const officialName = names?.find((name) => name.use === "official");
      const usualName = names?.find((name) => name.use === "usual");
      if (officialName) {
        return officialName.text;
      } else if (usualName) {
        return usualName.text;
      }
    }
    return "Unknown";
  }, [patient?.name]);

  return (
    <Card className="w-full bg-primary text-white shadow-primary">
      <CardHeader>
        <CardTitle className="text-xl">{patientName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <span className="font-semibold mr-1">Date of Birth:</span>
          {patient?.birthDate
            ? format(new Date(patient.birthDate), "do MMM yyyy")
            : "Unknown"}
        </p>
        <p>
          <span className="font-semibold mr-1 capitalize">Gender:</span>
          {patient?.gender}
        </p>
      </CardContent>
    </Card>
  );
};

import { useCallback, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { DatePicker } from "./ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Input } from "./ui/input";
import { Observation } from "fhir/r4";
import { getLSValue } from "@/utils/local-storage";
import { LOCALSTORAGE_KEYS } from "@/utils/constants";
import { useCreateVitalSign } from "@/services/observation/observation.data";

const vitalSigns = [
  {
    label: "Blood Pressure",
    value: "85354-9",
  },
  {
    label: "Heart rate",
    value: "69000-8",
  },
  { label: "Temperature Oral", value: "8331-1" },
];

export const CreateVitalSignSheet = () => {
  const [open, setOpen] = useState(false);
  const [vitalSign, setVitalSign] = useState<string>();
  const [date, setDate] = useState<Date>(new Date());
  const [value, setValue] = useState<Array<number> | number | null>(null);
  const patientId = useMemo(
    () => getLSValue(LOCALSTORAGE_KEYS.CURRENT_PATIENT) as string,
    []
  );
  const encounterId = useMemo(
    () => getLSValue(LOCALSTORAGE_KEYS.CURRENT_ENCOUNTER) as string | undefined,
    []
  );

  const { mutateAsync: createVitalSign, isPending } = useCreateVitalSign({
    onSuccess() {
      setOpen(false);
    },
  });

  const renderValueField = useCallback(() => {
    // blood pressure
    if (vitalSign === "85354-9") {
      return (
        <div className="flex items-center gap-x-1">
          <Input
            value={(value as number[])?.[0]}
            type="number"
            onChange={(e) => {
              const fieldValue = e.target.value;
              if (value !== undefined) {
                setValue([Number(fieldValue), (value as number[])?.[1]]);
              } else {
                setValue([Number(fieldValue)]);
              }
            }}
          />
          <span>/</span>
          <Input
            value={(value as number[])?.[1]}
            type="number"
            onChange={(e) => {
              const fieldValue = e.target.value;
              if (value !== undefined) {
                setValue([(value as number[])[0], Number(fieldValue)]);
              } else {
                setValue([value?.[0], Number(fieldValue)]);
              }
            }}
          />
        </div>
      );
    }
    if (["69000-8", "8331-1"].includes(vitalSign!)) {
      return (
        <Input
          type="number"
          value={value as number}
          onChange={(e) => {
            setValue(Number(e.target.value));
          }}
        />
      );
    }
  }, [vitalSign, value]);

  const getUnit = useCallback(() => {
    // blood pressure
    if (vitalSign === "85354-9") return "mm[Hg]";
    if (vitalSign === "69000-8") return "bpm";
    if (vitalSign === "8331-1") return "degC";
  }, [vitalSign]);

  const createPayload = useCallback(() => {
    const payload: Partial<Observation> = {
      resourceType: "Observation",
      effectiveDateTime: date.toISOString(),
      status: "final",
      subject: {
        reference: `Patient/${patientId}`,
      },
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs",
            },
          ],
          text: "Vital Signs",
        },
      ],
    };

    if (encounterId) {
      payload.encounter = {
        reference: `Encounter/${encounterId}`,
      };
    }

    // blood pressure
    if (vitalSign === "85354-9") {
      payload.code = {
        coding: [
          {
            system: "http://loinc.org",
            code: "85354-9",
          },
        ],
        text: "Blood pressure",
      };
      payload.component = [
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8480-6",
              },
            ],
            text: "Systolic Blood Pressure Invasive",
          },
          valueQuantity: {
            value: (value as number[])?.[0],
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mm[Hg]",
          },
        },
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8462-4",
              },
            ],
            text: "Diastolic Blood Pressure Invasive",
          },
          valueQuantity: {
            value: (value as number[])?.[1],
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mm[Hg]",
          },
        },
      ];
    }

    // heart rate
    if (vitalSign === "69000-8") {
      payload.code = {
        coding: [
          {
            system: "http://loinc.org",
            code: "69000-8",
            display: "Heart rate --sitting",
          },
        ],
        text: "Heart rate --sitting",
      };
      payload.valueQuantity = {
        value: value as number,
        unit: "bpm",
        system: "http://unitsofmeasure.org",
        code: "{beats}/min",
      };
    }

    // Temperature
    if (vitalSign === "8331-1") {
      payload.code = {
        coding: [
          {
            system: "http://loinc.org",
            code: "8331-1",
          },
        ],
        text: "Temperature Oral",
      };
      payload.valueQuantity = {
        value: value as number,
        unit: "degC",
        system: "http://unitsofmeasure.org",
        code: "Cel",
      };
    }

    return payload;
  }, [date, vitalSign, value, patientId, encounterId]);

  const handleSubmit = useCallback(async () => {
    const payload = createPayload();
    await createVitalSign(payload);
  }, [createPayload, createVitalSign]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button>Create vital sign</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[30rem] sm:w-[30rem]">
        <SheetHeader>
          <SheetTitle className="text-2xl">Create Vital Sign</SheetTitle>
        </SheetHeader>
        <div className="w-full mt-6 space-y-4">
          <div className="w-full flex flex-col gap-y-1">
            <label className="font-medium text-sm">Select vital</label>
            <Select
              value={vitalSign}
              onValueChange={(value) => {
                setValue(null);
                setVitalSign(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vital" />
              </SelectTrigger>
              <SelectContent>
                {vitalSigns.map((vitalSign) => (
                  <SelectItem value={vitalSign.value}>
                    {vitalSign.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex flex-col gap-y-1">
            <label className="font-medium text-sm">Date</label>
            <DatePicker date={date} setDate={setDate} />
          </div>
          {!!vitalSign && (
            <div className="flex items-center gap-x-4">
              <div className="w-full flex flex-col gap-y-1">
                <label className="font-medium text-sm">Value</label>
                {renderValueField()}
              </div>
              <div className="w-full flex flex-col gap-y-1">
                <label className="font-medium text-sm">Unit</label>
                <Input disabled value={getUnit()} />
              </div>
            </div>
          )}
        </div>
        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button variant="secondary">Close</Button>
          </SheetClose>
          <Button onClick={handleSubmit} isLoading={isPending}>
            Create
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

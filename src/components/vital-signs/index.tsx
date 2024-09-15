import { useGetVitalSigns } from "@/services/observation/observation.data";
import { Observation } from "fhir/r4";
import { useCallback, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Spinner } from "../ui/spinner";

const columnHelper = createColumnHelper<Observation>();

export const VitalSigns = () => {
  const { observationData, isLoading } = useGetVitalSigns();

  const observations = useMemo(
    () =>
      observationData?.entry
        ?.filter((entry) => entry.resource?.resourceType === "Observation")
        .map((entry) => entry.resource!) || [],
    [observationData]
  );

  console.log(observations);

  const getUnit = useCallback((report: Observation) => {
    if (report.component) {
      return report.component?.[0]?.valueQuantity?.unit;
    }
    if (report.valueQuantity) return report.valueQuantity?.unit || "Unknown";
    if (report.valueRange) {
      const high = report.valueRange.high?.unit;
      const low = report.valueRange.low?.unit;
      return `High: ${high !== undefined ? high : "Unknown"}, Low: ${
        low !== undefined ? low : "Unknown"
      }`;
    }
    if (report.valueRatio) {
      const numerator = report.valueRatio.numerator?.unit;
      const denominator = report.valueRatio.denominator?.unit;
      return `Numerator: ${
        numerator !== undefined ? numerator : "Unknown"
      }, Denominator${denominator !== undefined ? denominator : "Unknown"}`;
    }
    return "-";
  }, []);

  const getValue = useCallback((report: Observation | undefined) => {
    // ! this does not include valueCodeableConcept, valueSampledData
    if (!report) return "Unknown";
    if (report.component) {
      const systolic = report.component?.[0]?.valueQuantity?.value;
      const diastolic = report.component?.[1]?.valueQuantity?.value;
      return `${systolic || "Unknown"} / ${diastolic || "Unknown"}`;
    }
    if (report.valueQuantity) return report.valueQuantity.value;
    if (report.valueString) return report.valueString;
    if (report.valueBoolean) return report.valueBoolean ? "Yes" : "No";
    if (report.valueInteger) return report.valueInteger;
    if (report.valueRange) {
      const high = report.valueRange.high?.value;
      const low = report.valueRange.low?.value;
      return `High: ${high !== undefined ? high : "Unknown"}, Low: ${
        low !== undefined ? low : "Unknown"
      }`;
    }
    if (report.valueRatio) {
      const numerator = report.valueRatio.numerator?.value;
      const denominator = report.valueRatio.denominator?.value;
      return `${numerator !== undefined ? numerator : "Unknown"}/${
        denominator !== undefined ? denominator : "Unknown"
      }`;
    }
    if (report.valueTime)
      return format(new Date(report.valueTime), "do MMM yyyy");
    if (report.valueDateTime)
      return format(new Date(report.valueDateTime), "do MMM yyyy 'at' h:m a");
    if (report.valuePeriod) {
      const from = report.valuePeriod.start;
      const to = report.valuePeriod.end;
      return `From: ${
        from ? format(new Date(from), "do MMM yyyy 'at' h:m a") : "Unknown"
      }\nTo: ${
        to ? format(new Date(to), "do MMM yyyy 'at' h:m a") : "Unknown"
      }`;
    }
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("effectiveDateTime", {
        header: "Date",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return "Unknown";
          return format(new Date(value), "do MMM yyyy");
        },
      }),
      columnHelper.display({
        header: "Vital Sign",
        cell: ({ row }) => row.original.code.text || "Unknown",
      }),
      columnHelper.display({
        header: "Value",
        cell: ({ row }) => {
          const observation = row.original;
          return getValue(observation);
        },
      }),
      columnHelper.display({
        header: "Unit",
        cell: ({ row }) => {
          const observation = row.original;
          return getUnit(observation);
        },
      }),
    ],
    [getValue, getUnit]
  );

  const table = useReactTable({
    data: observations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full h-full flex flex-col gap-y-4">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Vital Signs</h2>
        <Button>Create vital sign</Button>
      </div>
      <div className="w-full h-full max-h-[70vh] overflow-auto border pb-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="w-full flex items-center justify-center my-10">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

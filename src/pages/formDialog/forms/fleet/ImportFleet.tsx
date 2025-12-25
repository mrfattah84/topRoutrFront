import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Upload, Select, Space, Table } from "antd";
import { useState } from "react";
import type { UploadFile } from "antd/es/upload/interface";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import dayjs from "dayjs";
import {
  useAddVehicleMutation,
  useCreateCostsMutation,
  useCreateFleetMutation,
  useCreateWorkScheduleMutation,
  useGetZonesQuery,
  useGetVehicleTypesQuery,
} from "./fleetApi";
import { useSignupMutation } from "../../../auth/authApi";
import { useAddAddressMutation, useGetAddressesQuery } from "../order/orderApi";

const { Dragger } = Upload;

// Expected system columns for fleet import
const SYSTEM_COLUMNS = [
  { value: "name", label: "Vehicle Name", required: true },
  { value: "vehicle_type", label: "Vehicle Type", required: false },
  { value: "weight", label: "Cap(Weight)", required: true },
  { value: "length", label: "Length", required: false },
  { value: "height", label: "Height", required: false },
  { value: "width", label: "Width", required: false },
  { value: "driver_name", label: "Driver Name", required: false },
  { value: "cell_phone", label: "Cell Phone", required: false },
  { value: "start_location_lat", label: "Start Location Lat", required: true },
  {
    value: "start_location_long",
    label: "Start Location Long",
    required: true,
  },
  { value: "end_location_lat", label: "End Location Lat", required: false },
  { value: "end_location_long", label: "End Location Long", required: false },
  { value: "work_hour_start", label: "Working Hour Start", required: true },
  { value: "work_hour_end", label: "Working Hour End", required: true },
  { value: "fixed_cost", label: "Fixed Cost", required: false },
  { value: "cost_per_km", label: "Cost per KM", required: false },
  { value: "cost_per_hour", label: "Cost per Hour", required: false },
  {
    value: "cost_per_hour_overtime",
    label: "Cost per Hour Overtime",
    required: false,
  },
  { value: "distance_limit", label: "Distance Limit(KM)", required: false },
  { value: "order_limit", label: "Order Limit", required: false },
];

const ImportFleet = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [step, setStep] = useState(0);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [allFileData, setAllFileData] = useState<any[]>([]);

  const [createVehicle] = useAddVehicleMutation();
  const [createCost] = useCreateCostsMutation();
  const [createWorkSchedule] = useCreateWorkScheduleMutation();
  const [createFleet] = useCreateFleetMutation();
  const [createDriver] = useSignupMutation();
  const [createAddress] = useAddAddressMutation();
  const { data: preDefinedLocations } = useGetAddressesQuery();
  const { data: vehicleTypes = [] } = useGetVehicleTypesQuery();

  const parseFile = async (file: File) => {
    if (!file || !file.name) {
      throw new Error("Invalid file");
    }

    const fileType = file.name.split(".").pop()?.toLowerCase();

    if (fileType === "csv") {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            const data = results.data;
            resolve({ headers, data });
          },
          error: (error) => reject(error),
        });
      });
    } else if (fileType === "xlsx" || fileType === "xls") {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = (jsonData[0] as string[]) || [];
            const dataRows = jsonData.slice(1).map((row: any) => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });

            resolve({ headers, data: dataRows });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    } else {
      throw new Error("Unsupported file type");
    }
  };

  const handleNextStep = async () => {
    if (step === 0) {
      try {
        await form.validateFields(["file"]);

        if (fileList.length === 0) {
          alert("Please upload a file first");
          return;
        }

        const uploadedFile = fileList[0];
        const file = uploadedFile.originFileObj || uploadedFile;

        if (!file) {
          alert("Could not access file. Please try uploading again.");
          return;
        }

        const { headers, data }: any = await parseFile(file as File);

        if (!headers || headers.length === 0) {
          alert("No columns found in file. Please check your file format.");
          return;
        }

        setFileColumns(headers);
        setPreviewData(data.slice(0, 5));
        setAllFileData(data);

        // Auto-map columns
        const autoMapping: Record<string, string> = {};
        headers.forEach((fileCol: string) => {
          const normalizedFileCol = fileCol
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[()]/g, "");

          const match = SYSTEM_COLUMNS.find(
            (sysCol) =>
              sysCol.value.toLowerCase().replace(/_/g, "") ===
              normalizedFileCol.replace(/_/g, "")
          );
          if (match) {
            autoMapping[fileCol] = match.value;
          }
        });

        setColumnMapping(autoMapping);
        setStep(1);
      } catch (error) {
        console.error("Failed to parse file:", error);
        alert(
          `Failed to parse file: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please check the file format.`
        );
      }
    } else if (step === 1) {
      const requiredColumns = SYSTEM_COLUMNS.filter((col) => col.required);
      const mappedSystemColumns = Object.values(columnMapping);
      const missingRequired = requiredColumns.filter(
        (col) => !mappedSystemColumns.includes(col.value)
      );

      if (missingRequired.length > 0) {
        alert(
          `Please map the following required columns: ${missingRequired
            .map((c) => c.label)
            .join(", ")}`
        );
        return;
      }

      setStep(2);
    } else if (step === 2) {
      await handleSubmit();
    }
  };


  const findVehicleTypeId = (vehicleTypeText: string) => {
    if (!vehicleTypeText || !vehicleTypes.length) return null;

    const normalizedInput = vehicleTypeText.toLowerCase().trim();

    // Try exact match on name
    let match = vehicleTypes.find(
      (vt) => vt.label?.toLowerCase() === normalizedInput
    );

    // Try partial match on name
    if (!match) {
      match = vehicleTypes.find((vt) =>
        vt.label?.toLowerCase().includes(normalizedInput)
      );
    }

    return match ? match.value : null;
  };

  const handleSubmit = async () => {
    try {
      console.log("=== FLEET IMPORT SUBMISSION ===");
      console.log("Column mapping:", columnMapping);
      console.log("Total rows to process:", allFileData.length);
      console.log("Available vehicle types:", vehicleTypes);

      const transformedFleets = allFileData.map((row) => {
        const transformedRow: any = {};
        Object.keys(columnMapping).forEach((fileCol) => {
          const systemCol = columnMapping[fileCol];
          if (
            systemCol &&
            row[fileCol] !== undefined &&
            row[fileCol] !== null
          ) {
            transformedRow[systemCol] = row[fileCol];
          }
        });
        return transformedRow;
      });

      console.log("Sample transformed data:", transformedFleets[0]);

      for (const fleet of transformedFleets) {
        try {
          // 1. Create or find start location
          let startLocationId = null;
          const existingStartLocation = preDefinedLocations.find(
            (loc) =>
              loc.latitude == fleet.start_location_lat &&
              loc.longitude == fleet.start_location_long
          );

          if (existingStartLocation) {
            startLocationId = existingStartLocation.uid;
          } else {
            const startLoc = await createAddress({
              description: `Start: ${fleet.name}`,
              location_data: {
                latitude: fleet.start_location_lat,
                longitude: fleet.start_location_long,
              },
            }).unwrap();
            startLocationId = startLoc.uid || startLoc;
          }

          // 2. Create or find end location
          let endLocationId = null;
          if (fleet.end_location_lat && fleet.end_location_long) {
            const existingEndLocation = preDefinedLocations.find(
              (loc) =>
                loc.latitude == fleet.end_location_lat &&
                loc.longitude == fleet.end_location_long
            );

            if (existingEndLocation) {
              endLocationId = existingEndLocation.uid;
            } else {
              const endLoc = await createAddress({
                description: `End: ${fleet.name}`,
                location_data: {
                  latitude: fleet.end_location_lat,
                  longitude: fleet.end_location_long,
                },
              }).unwrap();
              endLocationId = endLoc.uid || endLoc;
            }
          }

          // 3. Create work schedule
          const workSchedule = await createWorkSchedule({
            name: `Schedule: ${fleet.name}`,
            calendar_mode: "EN",
            timezone: "UTC",
            allow_weekly_off: true,
            start_time_1: fleet.work_hour_start
              ? `${fleet.work_hour_start}:00:00`
              : "08:00:00",
            end_time_1: fleet.work_hour_end
              ? `${fleet.work_hour_end}:00:00`
              : "17:00:00",
            break_minutes_1: 60,
          }).unwrap();

          // 4. Create cost
          const cost = await createCost({
            title: `Cost: ${fleet.name}`,
            description: `Cost structure for ${fleet.name}`,
            fixed_cost: fleet.fixed_cost || 0,
            per_km_cost: fleet.cost_per_km || 0,
            per_hour_cost: fleet.cost_per_hour || 0,
            per_hour_overtime_cost: fleet.cost_per_hour_overtime || 0,
            worktime: workSchedule.uid || workSchedule.id,
            limit_route_distance: !!fleet.distance_limit,
            distance_limit: fleet.distance_limit || null,
            owner: null,
          }).unwrap();

          // 5. Find vehicle type ID
          const vehicleTypeId = findVehicleTypeId(fleet.vehicle_type);
          console.log(
            `Vehicle type "${fleet.vehicle_type}" matched to ID: ${vehicleTypeId}`
          );

          // 6. Create vehicle
          const vehicle = await createVehicle({
            name: fleet.name,
            license_plate: `LP-${Date.now()}`,
            vehicle_type: vehicleTypeId,
            label: fleet.name,
            is_active: true,
            serial_number: `SN-${Date.now()}`,
            weight: fleet.weight || 1000,
            maxCapacity: fleet.weight || 1000,
            minCapacity: 0,
            length: fleet.length || 0,
            height: fleet.height || 0,
            width: fleet.width || 0,
            volume:
              (fleet.length || 0) * (fleet.height || 0) * (fleet.width || 0),
            maxVisitNumber: fleet.order_limit || 50,
            minVisitNumber: 1,
            has_custom_capacities: false,
            has_custom_features: false,
          }).unwrap();

          // 7. Create driver if driver info provided
          let driverUserId = null;
          if (fleet.driver_name || fleet.cell_phone) {
            const driver = await createDriver({
              first_name: fleet.driver_name || "Driver",
              phone: fleet.cell_phone || "",
              role: "driver",
            }).unwrap();
            driverUserId = driver.uid || driver.id;
          }

          // 9. Create fleet
          await createFleet({
            driver_user: driverUserId,
            vehicle: vehicle.uid || vehicle.id,
            start_location: startLocationId,
            start_location_latitude: fleet.start_location_lat,
            start_location_longitude: fleet.start_location_long,
            end_location: endLocationId,
            end_location_latitude: fleet.end_location_lat || null,
            end_location_longitude: fleet.end_location_long || null,
            cost_id: cost.uid || cost.id,
            work_schedule_id: workSchedule.uid || workSchedule.id,
            name: fleet.name,
            cell_phone: fleet.cell_phone || "",
            use_depot_as_start: false,
            use_last_order_as_end: !endLocationId,
            end_route: true,
          }).unwrap();

          console.log(`Successfully created fleet: ${fleet.name}`);
        } catch (error) {
          console.error(`Failed to create fleet ${fleet.name}:`, error);
        }
      }

      alert(`Successfully imported ${transformedFleets.length} fleets!`);

      // Reset form
      form.resetFields();
      setFileList([]);
      setFileColumns([]);
      setPreviewData([]);
      setAllFileData([]);
      setColumnMapping({});
      setStep(0);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Please check your data and try again.");
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList,
    beforeUpload: (file: File) => {
      const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
      const isXLSX =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx");
      const isXLS =
        file.type === "application/vnd.ms-excel" || file.name.endsWith(".xls");

      if (!isCSV && !isXLSX && !isXLS) {
        alert("You can only upload CSV, XLS, or XLSX files!");
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        alert("File must be smaller than 10MB!");
        return false;
      }

      setFileList([file as unknown as UploadFile]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setFileColumns([]);
      setPreviewData([]);
      setAllFileData([]);
      setColumnMapping({});
    },
  };

  const downloadTemplate = () => {
    const headers = [
      "Vehicle name(label)",
      "Vehicle type",
      "Cap(Weight)",
      "Length",
      "Height",
      "Width",
      "Driver name",
      "Cell phone",
      "start location lat",
      "Start location long",
      "End location lat",
      "End location long",
      "Working hour start",
      "Working hour End",
      "fixed cost",
      "Cost per KM",
      "Cost per hour",
      "Cost per hour overtime",
      "distance Limit(KM)",
      "Order limit",
    ];

    const sampleData = [
      "Truck01",
      "Truck",
      "1000",
      "120",
      "100",
      "240",
      "Ali",
      "9123434333",
      "344354",
      "37.565456",
      "36.56575688",
      "35.6324342",
      "36.67567",
      "8",
      "17",
      "Teh02,Teh12",
      "1000",
      "2",
      "1.5",
      "2.5",
      "40",
      "10",
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fleet Template");
    XLSX.writeFile(wb, "fleet_import_template.xlsx");
  };

  const handleColumnMappingChange = (
    fileColumn: string,
    systemColumn: string
  ) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fileColumn]: systemColumn,
    }));
  };

  const tableColumns = fileColumns.map((fileCol) => ({
    title: (
      <div style={{ minWidth: 150 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{fileCol}</div>
        <Select
          style={{ width: "100%" }}
          placeholder="Map to..."
          value={columnMapping[fileCol]}
          onChange={(value) => handleColumnMappingChange(fileCol, value)}
          options={[
            { value: "", label: "-- Ignore Column --" },
            ...SYSTEM_COLUMNS.map((col) => ({
              value: col.value,
              label: `${col.label}${col.required ? " *" : ""}`,
              disabled:
                Object.values(columnMapping).includes(col.value) &&
                columnMapping[fileCol] !== col.value,
            })),
          ]}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    ),
    dataIndex: fileCol,
    key: fileCol,
    width: 180,
    render: (text: any) => (
      <div
        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {String(text ?? "")}
      </div>
    ),
  }));

  return (
    <Form layout="vertical" form={form}>
      {step === 0 ? (
        <>
          <Alert
            message="Import Instructions"
            description="Upload a CSV or Excel file containing fleet data. Make sure your file follows the required format."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 16 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              style={{ marginBottom: 8 }}
            >
              Download Template File
            </Button>
            <div style={{ fontSize: 12, color: "#666" }}>
              Download a template file with the correct format and column
              headers
            </div>
          </div>

          <Form.Item
            label="Upload File"
            name="file"
            rules={[{ required: true, message: "Please upload a file" }]}
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for CSV, XLS, or XLSX files. Maximum file size: 10MB
              </p>
            </Dragger>
          </Form.Item>

          {fileList.length > 0 && (
            <Alert
              message="File Ready"
              description={`File "${fileList[0].name}" is ready. Click Next to map columns.`}
              type="success"
              style={{ marginTop: 16 }}
            />
          )}
        </>
      ) : step === 1 ? (
        <>
          <Alert
            message="Map Your Columns"
            description="Match your file columns to the system columns. Required fields are marked with *."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 16 }}>
            <strong>Preview Data (First 5 rows):</strong>
          </div>

          <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <Table
              columns={tableColumns}
              dataSource={previewData.map((row, index) => ({
                ...row,
                key: index,
              }))}
              pagination={false}
              scroll={{ x: "max-content" }}
              size="small"
              bordered
            />
          </div>

          <Alert
            message="Mapping Summary"
            description={
              <div>
                <div>
                  Mapped columns:{" "}
                  {
                    Object.keys(columnMapping).filter((k) => columnMapping[k])
                      .length
                  }{" "}
                  / {fileColumns.length}
                </div>
                <div>
                  Required columns mapped:{" "}
                  {
                    SYSTEM_COLUMNS.filter(
                      (col) =>
                        col.required &&
                        Object.values(columnMapping).includes(col.value)
                    ).length
                  }{" "}
                  / {SYSTEM_COLUMNS.filter((col) => col.required).length}
                </div>
              </div>
            }
            type={
              SYSTEM_COLUMNS.filter((col) => col.required).every((col) =>
                Object.values(columnMapping).includes(col.value)
              )
                ? "success"
                : "warning"
            }
            showIcon
            style={{ marginTop: 16 }}
          />
        </>
      ) : (
        <>
          <Alert
            message="Review and Confirm"
            description="Review the mapping before importing. The system will create vehicles, drivers, costs, and work schedules automatically."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 16 }}>
            <strong>Import Summary:</strong>
            <ul>
              <li>Total fleets to import: {allFileData.length}</li>
              <li>
                Columns mapped:{" "}
                {
                  Object.keys(columnMapping).filter((k) => columnMapping[k])
                    .length
                }
              </li>
              <li>
                Will create: vehicles, drivers, costs, work schedules, and
                locations
              </li>
              <li>
                Vehicle types available: {vehicleTypes.length} types loaded
              </li>
            </ul>
          </div>

          <Alert
            message="Ready to Import"
            description="Click Submit to begin the import process. This may take a few moments."
            type="success"
            showIcon
          />
        </>
      )}

      <Form.Item style={{ textAlign: "end", marginTop: 16 }}>
        <Space>
          {step > 0 && (
            <Button htmlType="button" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button type="primary" onClick={handleNextStep}>
            {step === 0 ? "Next (1/3)" : step === 1 ? "Next (2/3)" : "Submit"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ImportFleet;

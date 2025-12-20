import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Form,
  Upload,
  Select,
  Divider,
  Space,
  Table,
  Input,
} from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { UploadFile } from "antd/es/upload/interface";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const { Dragger } = Upload;

// Expected system columns with their descriptions
const SYSTEM_COLUMNS = [
  {
    value: "source_id",
    label: "Source Address",
    required: true,
    needsCreation: true,
  },
  {
    value: "destination_id",
    label: "Destination Address",
    required: true,
    needsCreation: true,
  },
  {
    value: "driver_id",
    label: "Driver ID",
    required: false,
    needsCreation: false,
  },
  {
    value: "assigned_to_id",
    label: "Assigned Vehicle ID",
    required: false,
    needsCreation: false,
  },
  {
    value: "cluster_id",
    label: "Cluster ID",
    required: false,
    needsCreation: false,
  },
  { value: "file_id", label: "File ID", required: false, needsCreation: false },
  {
    value: "delivery_order_sequence",
    label: "Delivery Order Sequence",
    required: false,
    needsCreation: false,
  },
  {
    value: "delivery_order",
    label: "Delivery Order",
    required: false,
    needsCreation: false,
  },
  {
    value: "delivery_date",
    label: "Delivery Date",
    required: false,
    needsCreation: false,
  },
  {
    value: "delivery_time_to",
    label: "Delivery Time To",
    required: false,
    needsCreation: false,
  },
  {
    value: "delivery_time_from",
    label: "Delivery Time From",
    required: false,
    needsCreation: false,
  },
  {
    value: "delivery_time_actual",
    label: "Delivery Time Actual",
    required: false,
    needsCreation: false,
  },
  {
    value: "stop_time",
    label: "Stop Time",
    required: false,
    needsCreation: false,
  },
  { value: "title", label: "Title", required: true, needsCreation: false },
  { value: "code", label: "Code", required: false, needsCreation: false },
  {
    value: "description",
    label: "Description",
    required: false,
    needsCreation: false,
  },
  {
    value: "activated",
    label: "Activated",
    required: false,
    needsCreation: false,
  },
  { value: "price", label: "Price", required: false, needsCreation: false },
  {
    value: "delay_reason",
    label: "Delay Reason",
    required: false,
    needsCreation: false,
  },
  {
    value: "order_type",
    label: "Order Type",
    required: true,
    needsCreation: false,
  },
  {
    value: "order_date",
    label: "Order Date",
    required: true,
    needsCreation: false,
  },
  {
    value: "priority",
    label: "Priority",
    required: false,
    needsCreation: false,
  },
  { value: "status", label: "Status", required: false, needsCreation: false },
  {
    value: "result_status",
    label: "Result Status",
    required: false,
    needsCreation: false,
  },
  {
    value: "live_status",
    label: "Live Status",
    required: false,
    needsCreation: false,
  },
  {
    value: "daily_status",
    label: "Daily Status",
    required: false,
    needsCreation: false,
  },
  {
    value: "assignment",
    label: "Assignment",
    required: false,
    needsCreation: false,
  },
  {
    value: "shipment_type",
    label: "Shipment Type",
    required: false,
    needsCreation: false,
  },
  {
    value: "order_item_id",
    label: "Order Item IDs",
    required: false,
    needsCreation: false,
  },
  // Address-related fields
  {
    value: "source_address_text",
    label: "Source Address Text",
    required: false,
    needsCreation: false,
  },
  {
    value: "source_latitude",
    label: "Source Latitude",
    required: false,
    needsCreation: false,
  },
  {
    value: "source_longitude",
    label: "Source Longitude",
    required: false,
    needsCreation: false,
  },
  {
    value: "destination_address_text",
    label: "Destination Address Text",
    required: false,
    needsCreation: false,
  },
  {
    value: "destination_latitude",
    label: "Destination Latitude",
    required: false,
    needsCreation: false,
  },
  {
    value: "destination_longitude",
    label: "Destination Longitude",
    required: false,
    needsCreation: false,
  },
];

const ImportOrder = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [step, setStep] = useState(0);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [allFileData, setAllFileData] = useState<any[]>([]);

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
        await form.validateFields(["format", "file"]);

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
        setPreviewData(data.slice(0, 5)); // First 5 rows for preview
        setAllFileData(data); // Store all data for processing

        // Auto-map columns with exact matches (case-insensitive)
        const autoMapping: Record<string, string> = {};
        headers.forEach((fileCol: string) => {
          const normalizedFileCol = fileCol
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_");
          const match = SYSTEM_COLUMNS.find(
            (sysCol) => sysCol.value.toLowerCase() === normalizedFileCol
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
      // Validate that all required columns are mapped
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

      // Move to address mapping step
      setStep(2);
    } else if (step === 2) {
      // Process and submit the import
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = form.getFieldsValue();

      console.log("=== ORDER IMPORT SUBMISSION ===");
      console.log("Import format:", formData.format);
      console.log("Column mapping:", columnMapping);
      console.log("Total rows to process:", allFileData.length);
      console.log("Files:", fileList);

      // Transform file data according to column mapping
      const transformedOrders = allFileData.map((row) => {
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

      console.log(
        "Sample transformed data (first 3 rows):",
        transformedOrders.slice(0, 3)
      );
      console.log("==============================");

      // Here you would:
      // 1. Create addresses for source/destination using the API
      // 2. Create orders with the transformed data
      // 3. Handle any errors and show progress

      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(`Successfully imported ${transformedOrders.length} orders!`);

      // Reset form
      form.resetFields();
      setFileList([]);
      setFileColumns([]);
      setPreviewData([]);
      setAllFileData([]);
      setColumnMapping({});
      setStep(0);
    } catch (error) {
      console.error("Form validation failed:", error);
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
    console.log("Downloading template...");
    alert("Template download would start here");
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

  // Generate table columns for step 1
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

  // Generate address mapping instructions
  const getAddressMappingInstructions = () => {
    const hasSourceAddress =
      Object.values(columnMapping).includes("source_address_text") ||
      (Object.values(columnMapping).includes("source_latitude") &&
        Object.values(columnMapping).includes("source_longitude"));

    const hasDestAddress =
      Object.values(columnMapping).includes("destination_address_text") ||
      (Object.values(columnMapping).includes("destination_latitude") &&
        Object.values(columnMapping).includes("destination_longitude"));

    return (
      <div style={{ marginBottom: 16 }}>
        <Alert
          title="Address Creation"
          description={
            <div>
              <p>
                The system will automatically create addresses for your orders:
              </p>
              <ul style={{ marginBottom: 0 }}>
                <li>
                  <strong>Source Addresses:</strong>{" "}
                  {hasSourceAddress
                    ? "✓ Will be created from mapped address data"
                    : "⚠️ No address data mapped - please ensure source_address_text or coordinates are mapped"}
                </li>
                <li>
                  <strong>Destination Addresses:</strong>{" "}
                  {hasDestAddress
                    ? "✓ Will be created from mapped address data"
                    : "⚠️ No address data mapped - please ensure destination_address_text or coordinates are mapped"}
                </li>
              </ul>
              <p style={{ marginTop: 8, marginBottom: 0 }}>
                <em>
                  Note: If addresses with the same coordinates already exist,
                  they will be reused.
                </em>
              </p>
            </div>
          }
          type={hasSourceAddress && hasDestAddress ? "success" : "warning"}
          showIcon
        />
      </div>
    );
  };

  return (
    <Form layout="vertical" form={form}>
      {step === 0 ? (
        <>
          <Alert
            title="Import Instructions"
            description="Upload a CSV or Excel file containing order data. Make sure your file follows the required format."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Import Format"
            name="format"
            rules={[{ required: true, message: "Please select import format" }]}
            initialValue="csv"
          >
            <Select
              placeholder="Select format"
              options={[
                { value: "csv", label: "CSV (Comma-separated)" },
                { value: "xlsx", label: "Excel (XLSX)" },
                { value: "xls", label: "Excel Legacy (XLS)" },
              ]}
            />
          </Form.Item>

          <Divider />

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
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
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
              title="File Ready"
              description={`File "${fileList[0].name}" is ready. Click Next to map columns.`}
              type="success"
              style={{ marginTop: 16 }}
            />
          )}

          <Alert
            title="Required Data"
            description="Your file should include: Title, Order Type, Order Date, and address information (either address text or coordinates)"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </>
      ) : step === 1 ? (
        <>
          <Alert
            title="Map Your Columns"
            description="Match your file columns to the system columns. Required fields are marked with *. Columns can be ignored by selecting '-- Ignore Column --'."
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
            title="Mapping Summary"
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
            title="Review and Confirm"
            description="Review the mapping and address creation settings before importing."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {getAddressMappingInstructions()}

          <div style={{ marginBottom: 16 }}>
            <strong>Import Summary:</strong>
            <ul>
              <li>Total orders to import: {allFileData.length}</li>
              <li>
                Columns mapped:{" "}
                {
                  Object.keys(columnMapping).filter((k) => columnMapping[k])
                    .length
                }
              </li>
              <li>Format: {form.getFieldValue("format")?.toUpperCase()}</li>
            </ul>
          </div>

          <Alert
            title="Ready to Import"
            description="The system will create any necessary addresses automatically. Click Submit to begin the import process."
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

export default ImportOrder;

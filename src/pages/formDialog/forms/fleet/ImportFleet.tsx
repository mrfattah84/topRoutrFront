import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Upload, Select, Divider } from "antd";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {

} from "../../dialogSlice";
import type { UploadFile } from "antd/es/upload/interface";

const { Dragger } = Upload;

const ImportFleet = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const shouldSubmit = useSelector(selectShouldSubmit);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const formData = form.getFieldsValue();

      console.log("=== FLEET IMPORT SUBMISSION ===");
      console.log("Import format:", formData.format);
      console.log("Import mode:", formData.mode);
      console.log("Validation level:", formData.validation);
      console.log("Files:", fileList);
      console.log("==============================");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      form.resetFields();
      setFileList([]);

    } catch (error) {
      console.error("Form validation failed:", error);

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
    },
  };

  const downloadTemplate = () => {
    console.log("Downloading fleet template...");
    alert("Fleet template download would start here");
  };

  return (
    <Form layout="vertical" form={form}>
      <Alert
        message="Import Instructions"
        description="Upload a CSV or Excel file containing fleet/vehicle data. Ensure your file follows the required format with all mandatory fields."
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

      <Form.Item
        label="Import Mode"
        name="mode"
        rules={[{ required: true, message: "Please select import mode" }]}
        initialValue="append"
      >
        <Select
          placeholder="Select mode"
          options={[
            {
              value: "append",
              label:
                "Append - Add new vehicles without affecting existing ones",
            },
            {
              value: "update",
              label: "Update - Update existing vehicles by ID",
            },
            {
              value: "replace",
              label:
                "Replace - Delete all existing vehicles and import new ones",
            },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Validation Level"
        name="validation"
        rules={[{ required: true, message: "Please select validation level" }]}
        initialValue="strict"
      >
        <Select
          placeholder="Select validation level"
          options={[
            {
              value: "strict",
              label: "Strict - Reject file if any errors found",
            },
            {
              value: "moderate",
              label: "Moderate - Skip rows with errors, import valid rows",
            },
            {
              value: "lenient",
              label: "Lenient - Auto-correct minor errors where possible",
            },
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
          Download Fleet Template File
        </Button>
        <div style={{ fontSize: 12, color: "#666" }}>
          Download a template file with the correct format and column headers
          for fleet data
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
          message="File Ready"
          description={`File "${fileList[0].name}" is ready to be imported. Click OK to proceed.`}
          type="success"
          style={{ marginTop: 16 }}
        />
      )}

      <Alert
        message="Required Columns"
        description="Your file must include these columns: Vehicle ID, Vehicle Name, Vehicle Type, License Plate, Driver Name, Driver Phone, Capacity, Max Weight, Max Volume, Fuel Type, Depot Location"
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />

      <Alert
        message="Driver Assignment"
        description="If driver information is included in the import file, make sure the drivers exist in the system or will be created automatically."
        type="info"
        showIcon
        style={{ marginTop: 8 }}
      />
    </Form>
  );
};

export default ImportFleet;

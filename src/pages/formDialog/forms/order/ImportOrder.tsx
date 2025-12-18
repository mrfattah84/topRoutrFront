import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Upload, Select, Divider } from "antd";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {

} from "../../dialogSlice";
import type { UploadFile } from "antd/es/upload/interface";

const { Dragger } = Upload;

const ImportOrder = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const formData = form.getFieldsValue();

      console.log("=== ORDER IMPORT SUBMISSION ===");
      console.log("Import format:", formData.format);
      console.log("Import mode:", formData.mode);
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
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const downloadTemplate = () => {
    // In a real app, this would download an actual template file
    console.log("Downloading template...");
    alert("Template download would start here");
  };

  return (
    <Form layout="vertical" form={form}>
      <Alert
        message="Import Instructions"
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
              label: "Append - Add new orders without affecting existing ones",
            },
            {
              value: "update",
              label: "Update - Update existing orders by ID",
            },
            {
              value: "replace",
              label: "Replace - Delete all existing orders and import new ones",
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
          Download Template File
        </Button>
        <div style={{ fontSize: 12, color: "#666" }}>
          Download a template file with the correct format and column headers
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
        description="Your file must include these columns: Order ID, Title, Origin Address, Destination Address, Volume, Quantity, Priority, Order Type"
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Form>
  );
};

export default ImportOrder;

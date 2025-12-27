// SignUp.tsx
import { GoogleOutlined } from "@ant-design/icons";
import { Input, Button, Select, Form, Alert, message } from "antd";
import React from "react";
import { useSignupMutation } from "./authApi";

interface SignUpProps {
  toggle: () => void;
}

interface SignUpFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC<SignUpProps> = ({ toggle }) => {
  const [form] = Form.useForm<SignUpFormValues>();

  const [signUp, { isLoading, error }] = useSignupMutation();

  const handleSubmit = async (values: SignUpFormValues) => {
    try {
      await signUp({
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
        first_name: values.first_name,
        last_name: values.last_name,
      }).unwrap();

      message.success("Account created successfully! Please log in.");
      form.resetFields();

      // Navigate to login or toggle to login form
      toggle();
      // Or use toggle() if it's in the same page
    } catch (err) {
      console.error("Failed to sign up:", err);
      // Error is already displayed via error state
    }
  };

  return (
    <div className="w-1/3 -mt-9 px-9 py-7 bg-[#f3f3f3]/50 rounded-2xl flex flex-col gap-2">
      <div className="text-2xl font-medium">Create an account</div>

      {error && (
        <Alert message={error as string} type="error" closable showIcon />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <div className="flex gap-2">
          <Form.Item
            label="First name"
            name="first_name"
            className="flex-1"
            rules={[
              { required: true, message: "Please enter your first name" },
              { min: 2, message: "First name must be at least 2 characters" },
            ]}
          >
            <Input
              className="bg-transparent! border-2! border-[#D1E9FF]!"
              placeholder="Enter your first name"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            label="Last name"
            name="last_name"
            className="flex-1 "
            rules={[
              { required: true, message: "Please enter your last name" },
              { min: 2, message: "Last name must be at least 2 characters" },
            ]}
          >
            <Input
              className="bg-transparent! border-2! border-[#D1E9FF]!"
              placeholder="Enter your last name"
              disabled={isLoading}
            />
          </Form.Item>
        </div>

        <div className="flex gap-2">
          <Form.Item
            label="Phone"
            name="phone"
            className="flex-1 "
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                pattern: /^09\d{9}$/,
                message: "Please enter a valid phone number (09XXXXXXXXX)",
              },
            ]}
          >
            <Input
              className="bg-transparent! border-2! border-[#D1E9FF]!"
              placeholder="09123456789"
              maxLength={11}
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            className="flex-1 "
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Select your role"
              disabled={isLoading}
              options={[
                { value: "logistic", label: "Logistic" },
                { value: "manager", label: "Manager" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            className="bg-transparent! border-2! border-[#D1E9FF]!"
            placeholder="balamia@gmail.com"
            disabled={isLoading}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Password must be at least 8 characters" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Password must contain uppercase, lowercase, and number",
            },
          ]}
        >
          <Input.Password
            className="bg-transparent! border-2! border-[#D1E9FF]!"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password
            className="bg-transparent! border-2! border-[#D1E9FF]!"
            placeholder="Confirm your password"
            disabled={isLoading}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            <span className="font-medium">Create account</span>
          </Button>
        </Form.Item>
      </Form>

      <Button block disabled={isLoading}>
        <span className="font-medium text-[#1570EF]">
          <GoogleOutlined className="mr-1" />
          Continue with Google
        </span>
      </Button>

      <div className="mx-auto">
        Already have an account?
        <Button type="link" onClick={toggle} disabled={isLoading}>
          Log in
        </Button>
      </div>
    </div>
  );
};

export default SignUp;

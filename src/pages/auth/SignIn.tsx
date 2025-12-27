import { GoogleOutlined } from "@ant-design/icons";
import { Input, Button, Form, Alert, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useOtpMutation } from "./authApi";

interface SignInProps {
  toggle: () => void;
}

interface LoginFormValues {
  email: string;
  password: string;
}

interface OtpFormValues {
  otp: string;
}

const SignIn: React.FC<SignInProps> = ({ toggle }) => {
  const [step, setStep] = useState<0 | 1>(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [loginForm] = Form.useForm<LoginFormValues>();
  const [otpForm] = Form.useForm<OtpFormValues>();

  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();
  const [otpCall, { isLoading: isOtpLoading, error: otpError }] =
    useOtpMutation();

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      const otp = await otpCall({
        email: values.email,
        password: values.password,
      }).unwrap();

      setEmail(values.email);
      setPassword(values.password);

      setStep(1);
      message.success(
        `OTP sent to ${otp.sent_to === "phone" ? otp.phone : otp.email}`
      );
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handleOtpSubmit = async (values: OtpFormValues) => {
    try {
      await login({
        email,
        password,
        otp: values.otp,
      }).unwrap();
      message.success("Login successful!");
      navigate("/home", { replace: true });

      loginForm.resetFields();
      otpForm.resetFields();
      setEmail("");
      setPassword("");
      setStep(0);
    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  const handleBackToLogin = () => {
    setStep(0);
    otpForm.resetFields();
  };

  return (
    <div className="w-1/3 mt-[2dvh] px-14 py-9 bg-[#f3f3f3]/50 rounded-2xl flex flex-col gap-4">
      {step === 0 ? (
        <>
          <div className="text-2xl font-medium">Login</div>

          {otpError && (
            <Alert title={otpError as string} type="error" closable showIcon />
          )}

          <Form
            form={loginForm}
            layout="vertical"
            onFinish={handleLoginSubmit}
            initialValues={{ email: "", password: "" }}
          >
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
                size="large"
                disabled={isOtpLoading}
              />
            </Form.Item>

            <Form.Item
              label={
                <div className="flex justify-between w-full">
                  <span>Password</span>
                  <Button type="link" size="small">
                    Forgot
                  </Button>
                </div>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                className="bg-transparent! border-2! border-[#D1E9FF]!"
                placeholder="Enter your password"
                size="large"
                disabled={isOtpLoading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isOtpLoading}
                block
              >
                <span className="font-medium">Continue</span>
              </Button>
            </Form.Item>
          </Form>

          <Button size="large" block>
            <span className="font-medium text-[#1570EF]">
              <GoogleOutlined className="mr-1" />
              Continue with Google
            </span>
          </Button>

          <div className="mx-auto">
            Don't have an account?
            <Button type="link" onClick={toggle}>
              Sign up
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button
            type="text"
            onClick={handleBackToLogin}
            className="self-start"
          >
            ← Back
          </Button>

          <div className="flex flex-col items-center gap-4">
            <div className="text-3xl font-bold">Enter OTP</div>
            <div className="text-gray-500 text-center">
              We've sent a verification code to
              <br />
              <span className="font-medium">{email}</span>
            </div>

            {loginError && (
              <Alert
                title={loginError as string}
                type="error"
                closable
                showIcon
                className="w-full"
              />
            )}

            <Form form={otpForm} onFinish={handleOtpSubmit} className="w-full">
              <Form.Item
                name="otp"
                rules={[
                  { required: true, message: "Please enter the OTP" },
                  { len: 6, message: "OTP must be 6 digits" },
                ]}
              >
                <Input.OTP
                  length={6}
                  className="m-auto gap-5!"
                  size="large"
                  disabled={isLoginLoading}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isLoginLoading}
                  block
                >
                  <span className="font-medium">Verify & Login</span>
                </Button>
              </Form.Item>
            </Form>

            <Button
              type="link"
              onClick={() => {
                handleBackToLogin();
                message.info("Please request a new OTP");
              }}
            >
              Didn't receive code? Resend
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SignIn;

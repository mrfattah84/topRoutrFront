import { GoogleOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { setCredentials, selectCurrentToken } from "./authSlice";
import { useLoginMutation, useOtpMutation } from "./authApi";
import { store } from "../../store";

interface SignInProps {
  toggle: () => void;
}

const SignIn = ({ toggle }: SignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [login] = useLoginMutation();
  const [otpCall] = useOtpMutation();
  const shouldNavigateRef = useRef(false);

  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);

  // Navigate when token becomes available after successful login
  useEffect(() => {
    if (shouldNavigateRef.current && token) {
      navigate("/home");
      shouldNavigateRef.current = false;
    }
  }, [token, navigate]);

  const handleSubmit = async () => {
    if (step == 0) {
      // Validate inputs before making the request
      if (!email || !email.trim()) {
        alert("Please enter your email address.");
        return;
      }
      if (!password || !password.trim()) {
        alert("Please enter your password.");
        return;
      }

      try {
        const result = await otpCall({ email: email.trim(), password: password });
        if ('error' in result && result.error) {
          console.error('OTP request error:', result.error);
          // Extract error message from different possible error formats
          const errorData = 'data' in result.error ? result.error.data : undefined;
          let errorMessage = 'Failed to request OTP. Please try again.';
          
          if (errorData) {
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (typeof errorData === 'object' && errorData !== null) {
              if ('error' in errorData && typeof errorData.error === 'string') {
                errorMessage = errorData.error;
              } else if ('message' in errorData && typeof errorData.message === 'string') {
                errorMessage = errorData.message;
              } else if (Array.isArray(errorData) && errorData.length > 0) {
                errorMessage = String(errorData[0]);
              } else {
                // Try to get first error message from object
                const firstKey = Object.keys(errorData)[0];
                if (firstKey) {
                  const firstError = (errorData as any)[firstKey];
                  errorMessage = Array.isArray(firstError) ? String(firstError[0]) : String(firstError);
                }
              }
            }
          }
          alert(errorMessage);
          return;
        }
        setStep(1);
      } catch (error: unknown) {
        console.error('OTP request exception:', error);
        let errorMessage = 'Something happened. Please try again later.';
        if (error && typeof error === 'object') {
          const err = error as { data?: { error?: string; message?: string }; message?: string };
          errorMessage = err?.data?.error || err?.data?.message || err?.message || errorMessage;
        }
        alert(errorMessage);
      }
    } else {
      try {
        const userData = await login({ email, password, otp }).unwrap();
        console.log("Login response:", userData);

        // Dispatch credentials
        dispatch(setCredentials({ ...userData, email }));

        // Wait for Redux state to update, then verify token is in store before navigating
        let retryCount = 0;
        const maxRetries = 10;

        const checkAndNavigate = () => {
          const currentState = store.getState();
          const tokenInStore = currentState.auth.token;
          console.log("Token in store:", tokenInStore, "Retry:", retryCount);

          if (tokenInStore) {
            console.log("Navigating to /home");
            // Use requestAnimationFrame to ensure React has processed state updates
            requestAnimationFrame(() => {
              navigate("/home", { replace: true });
            });
          } else if (retryCount < maxRetries) {
            // Retry after a short delay if token not yet in store
            retryCount++;
            setTimeout(checkAndNavigate, 50);
          } else {
            console.error("Token not found in store after max retries");
            // Fallback: try navigating anyway
            navigate("/home", { replace: true });
          }
        };

        // Start checking after a brief delay to allow Redux to process
        setTimeout(checkAndNavigate, 50);

        setEmail("");
        setPassword("");
        setOtp("");
        setStep(0);
      } catch (err) {
        console.error("Failed to login: ", err);
      }
    }
  };

  return (
    <div className="w-1/3 mt-[2dvh] px-14 py-9 bg-[#f3f3f3]/50 rounded-2xl flex flex-col gap-4">
      {step === 0 ? (
        <>
          <div className="text-2xl font-medium">Login</div>
          <div>
            <label>Email</label>
            <Input
              value={email}
              className="bg-transparent! border-2! border-[#D1E9FF]! "
              placeholder="balamia@gmail.com"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="flex justify-between">
              <div className="flex flex-col justify-end">Password</div>
              <Button variant="link" color="primary">
                Forgot
              </Button>
            </label>
            <Input.Password
              value={password}
              className="bg-transparent! border-2! border-[#D1E9FF]! "
              placeholder="Enter your password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl font-bold">OTP</label>
          <Input.OTP
            className="m-auto gap-5!"
            value={otp}
            onChange={(e) => {
              setOtp(e);
            }}
          />
        </div>
      )}
      <Button type="primary" size="large" onClick={handleSubmit}>
        <div className="font-medium">Login</div>
      </Button>
      <Button size="large">
        <div className="font-medium text-[#1570EF]">
          <GoogleOutlined className="mr-1" />
          Continue with Google
        </div>
      </Button>
      <div className="mx-auto">
        Dont have an account ?
        <Button variant="link" color="primary" onClick={toggle}>
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default SignIn;

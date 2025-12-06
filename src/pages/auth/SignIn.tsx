import { GoogleOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { setCredentials } from "./authSlice";
import { useLoginMutation } from "../../api/authApiSlice";

const SignIn = ({ toggle }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (step == 0) {
      try {
        //request for otp
        setStep(1);
      } catch {
        alert("aomething happened try again later");
      }
    } else {
      try {
        const userData = await login({ email, password, otp }).unwrap();
        dispatch(setCredentials({ ...userData, email }));
        setEmail("");
        setPassword("");
        setOtp("");
        setStep(0);
        navigate("/home");
      } catch (err) {
        console.error("Failed to login: ", err);
      }
    }
  };

  return (
    <div className="w-1/3 mt-[10dvh] px-14 py-9 bg-[#f3f3f3]/50 rounded-2xl flex flex-col gap-4">
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

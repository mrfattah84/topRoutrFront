import { GoogleOutlined } from "@ant-design/icons";
import { Input, Button, Select } from "antd";
import React from "react";
import { useSignupMutation } from "../../api/authApiSlice";
import { useDispatch } from "react-redux";

const SignUp = ({ toggle }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState("");
  const [fName, setFName] = React.useState("");
  const [lName, setLName] = React.useState("");

  const [signUp, { isLoading }] = useSignupMutation();

  const handlesubmit = async () => {
    if (email && password && phone && role && fName && lName) {
      try {
        const userData = await signUp({
          email,
          password,
          phone,
          role,
          fName,
          lName,
        }).unwrap();
        setEmail("");
        setPassword("");
        setFName("");
        setLName("");
        setPhone("");
        setRole("");
        navigate("/login");
      } catch (err) {
        console.error("Failed to login: ", err);
      }
    }
  };

  return (
    <div className="w-1/3 -mt-5 px-14 py-9 bg-[#f3f3f3]/50 rounded-2xl flex flex-col gap-4">
      <div className="text-2xl font-medium">Create an account</div>
      <div className="flex gap-2">
        <div>
          <label>First name</label>
          <Input
            value={fName}
            className="bg-transparent! border-2! border-[#D1E9FF]! "
            placeholder="enter your first name"
            onChange={(e) => {
              setFName(e.target.value);
            }}
          />
        </div>
        <div>
          <label>Last name</label>
          <Input
            value={lName}
            className="bg-transparent! border-2! border-[#D1E9FF]! "
            placeholder="enter your last name"
            onChange={(e) => {
              setLName(e.target.value);
            }}
          />
        </div>
      </div>
      <div>
        <label>phone</label>
        <Input
          value={phone}
          className="bg-transparent! border-2! border-[#D1E9FF]! "
          placeholder="09123456789"
          onChange={(e) => {
            setPhone(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col">
        <label>role</label>
        <Select
          value={role}
          onChange={(e) => {
            setRole(e);
          }}
          options={[
            { value: "driver", label: "Driver" },
            { value: "logistic", label: "Logistic" },
            { value: "manager", label: "Manager" },
          ]}
        />
      </div>
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
      <Button type="primary" size="large" onClick={handlesubmit}>
        <div className="font-medium">Create account</div>
      </Button>
      <Button size="large">
        <div className="font-medium text-[#1570EF]">
          <GoogleOutlined className="mr-1" />
          Continue with Google
        </div>
      </Button>
      <div className="mx-auto">
        Already have an account ?
        <Button variant="link" color="primary" onClick={toggle}>
          Log in
        </Button>
      </div>
    </div>
  );
};

export default SignUp;

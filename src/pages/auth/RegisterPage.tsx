import { GoogleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [login, setLogin] = React.useState(true);
  const navigate = useNavigate();

  function toggleLogin() {
    setLogin(!login);
  }

  return (
    <div className="bg-[url(/authBgPic.jpg)] bg-cover bg-position-[center_bottom_-4rem] w-full h-full">
      <div className="bg-black/50 w-full h-full flex justify-center items-center">
        <div className="border-4 w-11/12 h-10/12 rounded-3xl">
          <div className="flex justify-end items-center m-8">
            <Button variant="link" color="primary" size="large">
              <div className="text-l font-bold"> About us</div>
            </Button>
            <Button variant="link" color="primary" size="large">
              <div className="text-l font-bold"> Contact us</div>
            </Button>
            <Button
              type="link"
              shape="circle"
              onClick={() => navigate("/home")}
            >
              <img src={"./logo.svg"} alt="logo" className="w-10" />
            </Button>
          </div>
          <div className="flex">
            <div className="text-8xl font-bold w-1/2 ml-16">
              <span>Smarter</span>
              <br />
              <span className=" text-[#A7BED3]">Routes, Faster Deliveries</span>
            </div>
            {login ? (
              <SignIn toggle={toggleLogin} />
            ) : (
              <SignUp toggle={toggleLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

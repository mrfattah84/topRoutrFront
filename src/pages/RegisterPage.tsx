import { Button } from "antd";
import React from "react";

const RegisterPage = () => {
  return (
    <div className="bg-[url(/authBgPic.jpg)] bg-cover bg-position-[center_bottom_-4rem] w-full h-full">
      <div className="bg-black/50 w-full h-full flex justify-center items-center">
        <div className="border-4 w-11/12 h-10/12 rounded-3xl">
          <div className="flex justify-end items-center m-9">
            <Button variant="link" color="primary" size="large">
              <div className="text-l font-bold"> About us</div>
            </Button>
            <Button variant="link" color="primary" size="large">
              <div className="text-l font-bold"> Contact us</div>
            </Button>
            <Button type="link" shape="circle">
              <img src={"./logo.svg"} alt="logo" className="w-10" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

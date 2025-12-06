import { GoogleOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React from "react";

const RegisterPage = () => {
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
            <Button type="link" shape="circle">
              <img src={"./logo.svg"} alt="logo" className="w-10" />
            </Button>
          </div>
          <div className="flex">
            <div className="text-8xl font-bold w-1/2 ml-16">
              <span>Smarter</span>
              <br />
              <span className=" text-[#A7BED3]">Routes, Faster Deliveries</span>
            </div>
            <div className="w-1/3 mt-[10dvh] px-14 py-9 bg-[#f3f3f3]/50 rounded-2xl flex flex-col gap-4">
              <div className="text-2xl font-medium">Create an account</div>
              <div>
                <label>Email</label>
                <Input
                  className="bg-transparent! border-2! border-[#D1E9FF]! "
                  placeholder="balamia@gmail.com"
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
                  className="bg-transparent! border-2! border-[#D1E9FF]! "
                  placeholder="Enter your password"
                />
              </div>
              <Button type="primary" size="large">
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
                <Button variant="link" color="primary">
                  Log in
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import { CalendarOutlined } from "@ant-design/icons";
import { Form, Input, InputNumber } from "antd";
import React, { useEffect, useState } from "react";
import Calendar from "../../../data/Calendar";
import AddAddress from "../AddAddress";
import AddressSelector from "./AddressSelector";

const AddOrder = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setShowCalendar(false);
    }
  }, [selectedDate]);

  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);

  return (
    <Form layout="vertical">
      <Form.Item label="Date" name="date">
        <Input
          placeholder="Enter date"
          suffix={<CalendarOutlined />}
          value={
            selectedDate
              ? `${selectedDate.jd}/${selectedDate.jm}/${selectedDate.jy}`
              : ""
          }
          onClick={() => {
            setShowCalendar(!showCalendar);
          }}
        />
        {showCalendar && (
          <Calendar
            className="mt-2"
            onDateSelect={(date, jalaali) => {
              setSelectedDate(jalaali);
            }}
          />
        )}
      </Form.Item>

      {showAddOrigin ? (
        <Form.Item label="Add Origin Address">
          <AddAddress setShowAddAddress={setShowAddOrigin} />
        </Form.Item>
      ) : (
        <Form.Item label="Origin location" name="originLocation">
          <AddressSelector
            name="originLocation"
            onAddAddress={() => setShowAddOrigin(true)}
          />
        </Form.Item>
      )}

      {showAddDestination ? (
        <Form.Item label="Add Destination Address">
          <AddAddress setShowAddAddress={setShowAddDestination} />
        </Form.Item>
      ) : (
        <Form.Item label="Destination location" name="destinationLocation">
          <AddressSelector
            name="destinationLocation"
            onAddAddress={() => setShowAddDestination(true)}
          />
        </Form.Item>
      )}

      <Form.Item label="Volume" name="volume">
        <InputNumber
          style={{ width: "100%" }}
          placeholder="Enter volume"
          min="0"
          step="0.01"
        />
      </Form.Item>

      <Form.Item label="Quantity" name="quantity">
        <InputNumber
          style={{ width: "100%" }}
          placeholder="Enter quantity"
          min="0"
          step="1"
        />
      </Form.Item>

      <Form.Item label="Limit number of orders" name="limitNumberOfOrders">
        <InputNumber
          style={{ width: "100%" }}
          placeholder="Enter limit number of orders"
          min="0"
          step="1"
        />
      </Form.Item>

      <Form.Item label="Order Description" name="description">
        <Input.TextArea placeholder="Enter order description" rows={4} />
      </Form.Item>
    </Form>
  );
};

export default AddOrder;

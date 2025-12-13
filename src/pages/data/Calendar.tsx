import { useState, useMemo, type FC } from "react";
import jalaali from "jalaali-js";
import PropTypes from "prop-types";
import { DatePicker } from "antd";

type JalaaliDate = {
  jy: number;
  jm: number;
  jd: number;
};

type CalendarDay = {
  day: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  date: Date | null;
  jalaali?: JalaaliDate;
};

type CalendarProps = {
  onDateSelect?: (date: Date, jalaali: JalaaliDate) => void;
  onMonthChange?: (year: number, month: number) => void;
  selectedDate?: JalaaliDate;
  disablePast?: boolean;
};

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"]; // Saturday to Friday

const Calendar: FC<CalendarProps> = ({
  onDateSelect,
  onMonthChange,
  selectedDate,
  disablePast = true,
}) => {
  const today = jalaali.toJalaali(new Date());
  const [currentYear, setCurrentYear] = useState(today.jy);
  const [currentMonth, setCurrentMonth] = useState(today.jm);

  // Get current month's calendar days
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const daysInMonth = jalaali.jalaaliMonthLength(currentYear, currentMonth);
    const firstDay = jalaali.jalaaliToDateObject(currentYear, currentMonth, 1);
    const firstDayOfWeek = (firstDay.getDay() + 1) % 7; // Convert to Persian week (Saturday = 0)

    const days: CalendarDay[] = [];

    // Add previous month's trailing days if needed
    const prevMonthLength = jalaali.jalaaliMonthLength(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 12 : currentMonth - 1
    );

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLength - i;
      days.push({
        day,
        isCurrentMonth: false,
        isPast: true,
        date: null,
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const jDate = jalaali.jalaaliToDateObject(currentYear, currentMonth, day);
      const isPast =
        currentYear < today.jy ||
        (currentYear === today.jy && currentMonth < today.jm) ||
        (currentYear === today.jy &&
          currentMonth === today.jm &&
          day < today.jd);

      days.push({
        day,
        isCurrentMonth: true,
        isPast: disablePast ? isPast : false,
        date: jDate,
        jalaali: { jy: currentYear, jm: currentMonth, jd: day },
      });
    }

    // Fill remaining slots
    const remainingSlots = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPast: true,
        date: null,
      });
    }

    return days;
  }, [currentYear, currentMonth, today, disablePast]);

  const updateMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    onMonthChange?.(year, month);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      updateMonth(currentYear - 1, 12);
    } else {
      updateMonth(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      updateMonth(currentYear + 1, 1);
    } else {
      updateMonth(currentYear, currentMonth + 1);
    }
  };

  const handleDateClick = (dayInfo: CalendarDay) => {
    if (
      dayInfo.isCurrentMonth &&
      !dayInfo.isPast &&
      dayInfo.date &&
      dayInfo.jalaali
    ) {
      onDateSelect?.(dayInfo.date, dayInfo.jalaali);
    }
  };

  const handleYearMonthSelect = (year: number, month: number) => {
    updateMonth(year, month);
  };

  const handleToday = () => {
    updateMonth(today.jy, today.jm);
    const todayDate = jalaali.jalaaliToDateObject(today.jy, today.jm, today.jd);
    onDateSelect?.(todayDate, today);
  };

  // Generate Jalali year list (current year ± 12 years)
  const years = Array.from({ length: 25 }, (_, i) => today.jy - 12 + i);
  const months = PERSIAN_MONTHS.map((name, index) => ({
    name,
    number: index + 1,
  }));

  return (
    <div className="flex gap-2 h-full">
      <div className="flex-1 p-6 bg-[#f6f8fc] rounded-xl flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl text-[#0A214A]">
            {PERSIAN_MONTHS[currentMonth - 1]} {currentYear}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cursor-pointer text-3xl text-[#0A214A]"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              type="button"
              className="cursor-pointer text-3xl text-[#0A214A]"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
            <button
              type="button"
              className=" text-[#36d4c0] font-semibold cursor-pointer"
              onClick={handleToday}
            >
              امروز
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 [direction:rtl]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-[0.85rem] text-[rgba(10,33,74,0.6)] p-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => {
            const isSelected =
              selectedDate &&
              dayInfo.jalaali &&
              dayInfo.jalaali.jy === selectedDate.jy &&
              dayInfo.jalaali.jm === selectedDate.jm &&
              dayInfo.jalaali.jd === selectedDate.jd;

            const isToday =
              dayInfo.isCurrentMonth &&
              dayInfo.jalaali &&
              dayInfo.jalaali.jy === today.jy &&
              dayInfo.jalaali.jm === today.jm &&
              dayInfo.jalaali.jd === today.jd;

            return (
              <button
                key={index}
                type="button"
                className={[
                  "aspect-square rounded-lg cursor-pointer text-[0.9rem] font-medium text-[#0A214A] transition-all flex items-center justify-center border-0 bg-transparent",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  "hover:bg-[#e8f2ff] hover:text-[#0a6fb0] disabled:hover:bg-transparent disabled:hover:text-[#0A214A]",
                  !dayInfo.isCurrentMonth &&
                    "text-[rgba(10,33,74,0.3)] cursor-default hover:bg-transparent hover:text-[rgba(10,33,74,0.3)]",
                  dayInfo.isPast &&
                    "text-[rgba(10,33,74,0.3)] cursor-not-allowed opacity-50",
                  isSelected && "  bg-[#36d4c0]! text-white font-bold",
                  isToday && "text-[#36d4c0] font-bold",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={
                  !dayInfo.isCurrentMonth || (disablePast && dayInfo.isPast)
                }
                onClick={() => handleDateClick(dayInfo)}
              >
                {dayInfo.day}
              </button>
            );
          })}
        </div>

        <div className=" flex items-center justify-between text-sm text-[#0A214A] bg-[#f6f8fc] rounded-lg px-3 py-2">
          <div className="font-semibold">تاریخ انتخاب‌شده:</div>
          <div className="font-medium [direction:rtl]">
            {selectedDate
              ? `${selectedDate.jd} ${PERSIAN_MONTHS[selectedDate.jm - 1]} ${
                  selectedDate.jy
                }`
              : "—"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col no-scrollbar overflow-y-auto bg-[#f6f8fc] rounded-xl">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={[
                "px-3 py-2 text-black transition-all text-center",
                "hover:bg-[rgba(54,212,192,0.1)]",
                year === currentYear && "bg-[#36d4c0] text-white font-semibold",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleYearMonthSelect(year, currentMonth)}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="flex flex-col no-scrollbar overflow-y-auto bg-[#f6f8fc] rounded-xl">
          {months.map(({ name, number }) => (
            <button
              key={number}
              type="button"
              className={[
                "px-3 py-2 text-black transition-all text-center whitespace-nowrap",
                "hover:bg-[rgba(54,212,192,0.1)]",
                number === currentMonth &&
                  "bg-[#36d4c0] text-white font-semibold",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleYearMonthSelect(currentYear, number)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Calendar.propTypes = {
  onDateSelect: PropTypes.func,
  onMonthChange: PropTypes.func,
  selectedDate: PropTypes.shape({
    jy: PropTypes.number,
    jm: PropTypes.number,
    jd: PropTypes.number,
  }),
  disablePast: PropTypes.bool,
};

export default Calendar;

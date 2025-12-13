import { useState, useMemo, type FC } from "react";
import jalaali from "jalaali-js";
import PropTypes from "prop-types";

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

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const Calendar: FC<CalendarProps> = ({
  onDateSelect,
  onMonthChange,
  selectedDate: externalSelectedDate,
  disablePast = true,
  className = "",
}) => {
  const today = jalaali.toJalaali(new Date());
  const [currentYear, setCurrentYear] = useState(today.jy);
  const [currentMonth, setCurrentMonth] = useState(today.jm);
  const [selectedDate, setSelectedDate] = useState<JalaaliDate | undefined>(
    externalSelectedDate
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const daysInMonth = jalaali.jalaaliMonthLength(currentYear, currentMonth);
    const firstDay = jalaali.jalaaliToDateObject(currentYear, currentMonth, 1);
    const firstDayOfWeek = (firstDay.getDay() + 1) % 7;

    const days: CalendarDay[] = [];

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

    const remainingSlots = 42 - days.length;
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
      setSelectedDate(dayInfo.jalaali);
      onDateSelect?.(dayInfo.date, dayInfo.jalaali);
    }
  };

  const years = Array.from({ length: 25 }, (_, i) => today.jy - 12 + i);

  return (
    <div className={"flex gap-2 h-full " + className}>
      {/* Main Calendar */}
      <div className="w-[400px] h-[400px] p-6 bg-gray-50 rounded-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-2xl text-gray-700 hover:text-gray-900 cursor-pointer w-8 h-8 flex items-center justify-center"
              onClick={handlePrevMonth}
            >
              ‹
            </button>
            <button
              type="button"
              className="text-2xl text-gray-700 hover:text-gray-900 cursor-pointer w-8 h-8 flex items-center justify-center"
              onClick={handleNextMonth}
            >
              ›
            </button>
          </div>

          <div className="font-semibold text-lg text-gray-900">
            {PERSIAN_MONTHS[currentMonth - 1]} {currentYear}
          </div>

          <button
            type="button"
            className="text-teal-400 hover:text-teal-500 font-semibold text-sm cursor-pointer px-3 py-1 rounded hover:bg-gray-50"
            onClick={() => {
              updateMonth(today.jy, today.jm);
              const todayDate = jalaali.jalaaliToDateObject(
                today.jy,
                today.jm,
                today.jd
              );
              setSelectedDate(today);
              onDateSelect?.(todayDate, today);
            }}
          >
            امروز
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 [direction:rtl]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-sm text-gray-600 p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
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
                className={`
                  aspect-square rounded-lg cursor-pointer text-sm font-medium transition-all 
                  flex items-center justify-center border-0 bg-transparent
                  ${
                    !dayInfo.isCurrentMonth
                      ? "text-gray-300 cursor-default hover:bg-transparent"
                      : ""
                  }
                  ${
                    dayInfo.isCurrentMonth && !dayInfo.isPast
                      ? "text-gray-900 hover:bg-gray-100"
                      : ""
                  }
                  ${
                    dayInfo.isPast && dayInfo.isCurrentMonth
                      ? "text-gray-400 cursor-not-allowed opacity-50"
                      : ""
                  }
                  ${
                    isSelected
                      ? "bg-teal-400! text-white hover:bg-teal-400"
                      : ""
                  }
                  ${isToday && !isSelected ? "bg-gray-200 font-semibold" : ""}
                `}
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
      </div>

      {/* Year Picker */}
      <div className="w-24 bg-gray-50 rounded-xl flex flex-col overflow-y-auto h-[400px] no-scrollbar">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            className={`
              px-4 py-3 text-sm transition-all text-center border-0 cursor-pointer
              ${
                year === currentYear
                  ? "bg-teal-400 text-white font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
            onClick={() => updateMonth(year, currentMonth)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Month Picker */}
      <div className="w-32 bg-gray-50 rounded-xl flex flex-col overflow-y-auto h-[400px] no-scrollbar">
        {PERSIAN_MONTHS.map((name, index) => (
          <button
            key={index}
            type="button"
            className={`
              px-4 py-3 text-sm transition-all text-center whitespace-nowrap border-0 cursor-pointer
              ${
                index + 1 === currentMonth
                  ? "bg-teal-400 text-white font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
            onClick={() => updateMonth(currentYear, index + 1)}
          >
            {name}
          </button>
        ))}
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

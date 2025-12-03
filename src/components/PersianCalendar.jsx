import { useState, useMemo } from 'react'
import jalaali from 'jalaali-js'
import PropTypes from 'prop-types'

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] // Saturday to Friday

function PersianCalendar({ onDateSelect, selectedDate }) {
  const today = jalaali.toJalaali(new Date())
  const [currentYear, setCurrentYear] = useState(today.jy)
  const [currentMonth, setCurrentMonth] = useState(today.jm)

  // Get current month's calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = jalaali.jalaaliMonthLength(currentYear, currentMonth)
    const firstDay = jalaali.jalaaliToDateObject(currentYear, currentMonth, 1)
    const firstDayOfWeek = (firstDay.getDay() + 1) % 7 // Convert to Persian week (Saturday = 0)

    const days = []
    
    // Add previous month's trailing days if needed
    const prevMonthLength = jalaali.jalaaliMonthLength(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 12 : currentMonth - 1
    )
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLength - i
      days.push({
        day,
        isCurrentMonth: false,
        isPast: true,
        date: null,
      })
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const jDate = jalaali.jalaaliToDateObject(currentYear, currentMonth, day)
      const isPast =
        currentYear < today.jy ||
        (currentYear === today.jy && currentMonth < today.jm) ||
        (currentYear === today.jy && currentMonth === today.jm && day < today.jd)
      
      days.push({
        day,
        isCurrentMonth: true,
        isPast,
        date: jDate,
        jalaali: { jy: currentYear, jm: currentMonth, jd: day },
      })
    }

    // Fill remaining slots
    const remainingSlots = 42 - days.length // 6 rows * 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPast: true,
        date: null,
      })
    }

    return days
  }, [currentYear, currentMonth, today])

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (dayInfo) => {
    if (dayInfo.isCurrentMonth && !dayInfo.isPast && dayInfo.date) {
      onDateSelect?.(dayInfo.date, dayInfo.jalaali)
    }
  }

  const handleYearMonthSelect = (year, month) => {
    setCurrentYear(year)
    setCurrentMonth(month)
  }

  // Generate Jalali year list (current year ± 12 years)
  const years = Array.from({ length: 25 }, (_, i) => today.jy - 12 + i)
  const months = PERSIAN_MONTHS.map((name, index) => ({ name, number: index + 1 }))

  return (
    <div className="persian-calendar-container">
      <div className="calendar-main">
        <div className="calendar-header">
          <div className="calendar-header-left">
            <span className="calendar-month-year-display">
              {PERSIAN_MONTHS[currentMonth - 1]} {currentYear}
            </span>
            <span className="calendar-chevron">›</span>
          </div>
          <div className="calendar-header-right">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((dayInfo, index) => {
            const isSelected =
              selectedDate &&
              dayInfo.jalaali &&
              dayInfo.jalaali.jy === selectedDate.jy &&
              dayInfo.jalaali.jm === selectedDate.jm &&
              dayInfo.jalaali.jd === selectedDate.jd
            
            const isToday =
              dayInfo.isCurrentMonth &&
              dayInfo.jalaali &&
              dayInfo.jalaali.jy === today.jy &&
              dayInfo.jalaali.jm === today.jm &&
              dayInfo.jalaali.jd === today.jd

            return (
              <button
                key={index}
                type="button"
                className={`calendar-day ${
                  !dayInfo.isCurrentMonth ? 'other-month' : ''
                } ${dayInfo.isPast ? 'past' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                disabled={!dayInfo.isCurrentMonth || dayInfo.isPast}
                onClick={() => handleDateClick(dayInfo)}
              >
                {dayInfo.day}
              </button>
            )
          })}
        </div>
      </div>

      <div className="year-month-picker-sidebar">
        <div className="picker-section">
          <div className="picker-title">سال</div>
          <div className="picker-list">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className={`picker-item ${year === currentYear ? 'selected' : ''}`}
                onClick={() => handleYearMonthSelect(year, currentMonth)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div className="picker-section">
          <div className="picker-title">ماه</div>
          <div className="picker-list">
            {months.map(({ name, number }) => (
              <button
                key={number}
                type="button"
                className={`picker-item ${number === currentMonth ? 'selected' : ''}`}
                onClick={() => handleYearMonthSelect(currentYear, number)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

PersianCalendar.propTypes = {
  onDateSelect: PropTypes.func,
  selectedDate: PropTypes.shape({
    jy: PropTypes.number,
    jm: PropTypes.number,
    jd: PropTypes.number,
  }),
}

export default PersianCalendar


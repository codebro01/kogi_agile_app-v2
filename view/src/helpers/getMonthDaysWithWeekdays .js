export const getMonthDaysWithWeekdays = (year, month) => {
  const days = []
  const date = new Date(year, month, 1) // month is 0-based (0 = Jan)

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  while (date.getMonth() === month) {
    const day = date.getDate()
    const weekday = dayNames[date.getDay()]
    days.push({
      label: `${weekday} (${day})`,
      date: date.toISOString().split('T')[0],
    })
    date.setDate(day + 1)
  }

  return days
}

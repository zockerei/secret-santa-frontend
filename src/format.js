// Event dates come as 'YYYY-MM-DD'. new Date() reads those as UTC midnight,
// so they are formatted in UTC too, otherwise some time zones would show the day before.
export function formatDate(date) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

// Today as 'YYYY-MM-DD' in local time, comparable with event dates
function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// An event is over the day after its date
export function isPast(date) {
  return date < today()
}

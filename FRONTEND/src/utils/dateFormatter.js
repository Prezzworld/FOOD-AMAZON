export function formatMongoDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit'
  })

  if(startOfDate.getTime() === startOfToday.getTime()) {
    return `${timeFormatter.format(date)} Today`;
  }
  if (startOfDate.getTime() === startOfYesterday.getTime()) {
    return `${timeFormatter.format(date)} Yesterday`;
  }

  return dateFormatter.format(date);
}
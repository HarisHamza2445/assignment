import { formatDate, formatShortDate } from '../../utils/date';

function DueDateCell({ task, longFormat = false }) {
  const label = longFormat ? formatDate(task.dueDate) : formatShortDate(task.dueDate);

  if (!task.isOverdue) return <span>{label}</span>;
  return <span className="overdue-text">{label} (Overdue)</span>;
}

export default DueDateCell;

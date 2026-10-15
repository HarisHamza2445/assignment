import { formatDate, formatDateTime } from '../../utils/date';

function TaskTimeline({ task }) {
  const items = [
    { label: 'Created', value: formatDateTime(task.createdAt), done: true },
    { label: 'Start date', value: formatDate(task.startDate), done: true },
    { label: 'Due date', value: formatDate(task.dueDate), done: task.status === 'Completed', danger: task.isOverdue },
  ];

  if (task.status === 'Completed') {
    items.push({ label: 'Completed', value: formatDateTime(task.completedDate), done: true });
  }
  if (task.status === 'Cancelled') {
    items.push({ label: 'Cancelled', value: formatDateTime(task.updatedAt), done: true });
  }

  return (
    <ul className="timeline">
      {items.map((item) => (
        <li
          key={item.label}
          className={`timeline__item${item.done ? ' timeline__item--done' : ''}${item.danger ? ' timeline__item--danger' : ''}`}
        >
          <span className="timeline__label">{item.label}</span>
          <span className="timeline__value">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default TaskTimeline;

const mongoose = require('mongoose');
const {
  DEPARTMENTS,
  PRIORITIES,
  PRIORITY_RANK,
  TASK_STATUS,
  STATUS_TRANSITIONS,
  ACTIVE_TASK_STATUSES,
} = require('../constants');
const { getToday } = require('../utils/dates');

// Copy of the employee details at assignment time. Keeps old tasks readable
// even after the employee record is deleted.
const employeeSnapshotSchema = new mongoose.Schema(
  {
    employeeId: String,
    fullName: String,
    email: String,
    department: String,
    role: String,
    removed: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeSnapshot: { type: employeeSnapshotSchema, required: true },
    department: { type: String, required: true, enum: DEPARTMENTS },
    priority: { type: String, required: true, enum: PRIORITIES },
    priorityRank: { type: Number },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
    },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ employee: 1, status: 1 });
taskSchema.index({ department: 1 });
taskSchema.index({ priorityRank: 1 });
taskSchema.index({ createdAt: -1 });

taskSchema.pre('validate', function setPriorityRank(next) {
  if (this.priority) {
    this.priorityRank = PRIORITY_RANK[this.priority];
  }
  next();
});

function isTaskOverdue(task, today = getToday()) {
  if (!ACTIVE_TASK_STATUSES.includes(task.status)) return false;
  return new Date(task.dueDate).getTime() < today.getTime();
}

taskSchema.virtual('isOverdue').get(function getIsOverdue() {
  return isTaskOverdue(this);
});

taskSchema.virtual('nextStatuses').get(function getNextStatuses() {
  return STATUS_TRANSITIONS[this.status] || [];
});

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.priorityRank;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.isTaskOverdue = isTaskOverdue;

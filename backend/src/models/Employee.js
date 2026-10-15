const mongoose = require('mongoose');
const { DEPARTMENTS, EMPLOYEE_STATUS } = require('../constants');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, enum: DEPARTMENTS },
    role: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(EMPLOYEE_STATUS),
      default: EMPLOYEE_STATUS.ACTIVE,
    },
    skills: { type: [String], default: [] },
    leaveStart: { type: Date, default: null },
    leaveEnd: { type: Date, default: null },
    // Number of Todo + In Progress tasks. Updated atomically by the task service,
    // which is what makes the "max 3 active tasks" rule safe under concurrent requests.
    activeTaskCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 1 });
employeeSchema.index({ department: 1, status: 1 });

employeeSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Employee', employeeSchema);

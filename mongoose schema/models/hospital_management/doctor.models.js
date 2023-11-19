import mongoose from 'mongoose';

const hopitalHourSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hospital',
    required: true
  },
  hour: {
    type: Number,
    required: true
  }
})

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  experienceInYears: {
    type: Number,
    default: 0,
  },
  worksIn: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    }
  ],
  hourworked: {
    type: [hospitalHourSchema]
  }
}, { timestamps: true });

export const Doctor = mongoose.model(
  'Doctor',
  doctorSchema
);
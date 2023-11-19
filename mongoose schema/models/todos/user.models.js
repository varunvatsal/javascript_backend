import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercasee: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'password must be there'], // coustem error msg on the 1st index of array
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);

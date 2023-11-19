import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    coustmer: {
      type: mongoose.Schema.Types.ObjecId,
      ref: 'user',
    },
    orderItems: {
      type: [orderItemSchema],
    },
    address: {
      type: String,
      required: true
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CANCELLED', 'DELIVERED'], // to restrict options
      default: 'PENDING',
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);

import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  discription:{
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    requied: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0
  },
  category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: true,
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {timestamps: true})

export const Product = mongoose.model('Product', productSchema)
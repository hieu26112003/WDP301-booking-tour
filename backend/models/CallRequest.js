import mongoose from 'mongoose'

const callRequestSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  tourTitle: {
    type: String, // Tên tour người dùng yêu cầu gọi lại
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('CallRequest', callRequestSchema)

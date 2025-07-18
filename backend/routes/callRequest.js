  import express from 'express'
  import CallRequest from '../models/CallRequest.js'

  const router = express.Router()

  // POST /api/call-request
  router.post('/call-request', async (req, res) => {
    try {
      const { phone, tourTitle } = req.body

      // Regex kiểm tra số điện thoại Việt Nam
      const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/
      if (!phone || !phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
      }

      const newRequest = new CallRequest({ phone, tourTitle })
      await newRequest.save()

      res.status(201).json({ message: 'Đã lưu yêu cầu gọi lại thành công' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Lỗi server' })
    }
  })

  export default router

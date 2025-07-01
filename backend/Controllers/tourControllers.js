import Tour from '../models/Tour.js'

//Create new tour
export const createTour = async (req, res) => {
   const newTour = new Tour(req.body)

   try {
      const savedTour = await newTour.save()

      res.status(200).json({ success: true, message: 'Successfully created', data: savedTour })
   } catch (error) {
      res.status(500).json({ success: true, message: 'Failed to create. Try again!' })
   }
}

//Update Tour
export const updateTour = async (req, res) => {
   const id = req.params.id

   try {
      const updatedTour = await Tour.findByIdAndUpdate(id, {
         $set: req.body
      }, { new: true })

      res.status(200).json({ success: true, message: 'Successfully updated', data: updatedTour })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update' })
   }
}

//Delete Tour
export const deleteTour = async (req, res) => {
   const id = req.params.id

   try {
      await Tour.findByIdAndDelete(id)

      res.status(200).json({ success: true, message: 'Successfully deleted' })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete' })
   }
}

//Getsingle Tour
export const getSingleTour = async (req, res) => {
   const id = req.params.id

   try {
      const tour = await Tour.findById(id).populate('reviews')

      res.status(200).json({ success: true, message: 'Successfully', data: tour })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

export const getAllTour = async (req, res) => {
   try {
       // Lấy số trang từ query, nếu không có mặc định là 1
       const page = parseInt(req.query.page) || 1;
       const limit = parseInt(req.query.limit) || 6;
       const skip = (page - 1) * limit;

       // Lấy danh sách tour
       const tours = await Tour.find({})
           .populate('reviews') // Nếu cần lấy review
           .skip(skip)
           .limit(limit);

       // Đếm tổng số tour để tính số trang
       const totalTours = await Tour.countDocuments();
       const totalPages = Math.ceil(totalTours / limit);

       res.status(200).json({
           success: true,
           count: tours.length,
           currentPage: page,
           totalPages,
           data: tours,
       });
   } catch (error) {
       console.error("Error fetching tours:", error);
       res.status(500).json({ success: false, message: 'Failed to fetch tours' });
   }
};



// Get tour by search
export const getTourBySearch = async (req, res) => {

   // hear 'i' means case sensitive 
   const city = new RegExp(req.query.city, 'i')
   const distance = parseInt(req.query.distance)
   const maxGroupSize = parseInt(req.query.maxGroupSize)

   try {
      // gte means greater than equal
      const tours = await Tour.find({ city, distance: { $gte: distance }, maxGroupSize: { $gte: maxGroupSize } }).populate('reviews')

      res.status(200).json({ success: true, message: 'Successfully', data: tours })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

//Get featured Tour
export const getFeaturedTour = async (req, res) => {
   //console.log(page)

   try {
      const tours = await Tour.find({ featured: true }).populate('reviews').limit(8)

      res.status(200).json({ success: true, message: 'Successfully', data: tours })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

//Get tour count 
export const getTourCount = async (req, res) => {
   try {
      const tourCount = await Tour.estimatedDocumentCount()

      res.status(200).json({ success: true, data: tourCount })
   } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch" })
   }
}
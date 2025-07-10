import express from 'express'
import {
  createTour,
  deleteTour,
  getAllTour,
  getFeaturedTour,
  getSingleTour,
  getTourBySearch,
  getTourCount,
  updateTour,
  getToursByCategory
} from '../Controllers/tourControllers.js'

const router = express.Router()

// Create tour
router.post('/', createTour)

// Update tour
router.put('/:id', updateTour)

// Delete tour
router.delete('/:id', deleteTour)

// Get single tour
router.get('/:id', getSingleTour)

// Get all tours
router.get('/', getAllTour)

// Search, featured, count
router.get("/search/getTourBySearch", getTourBySearch)
router.get("/search/getFeaturedTour", getFeaturedTour)
router.get("/search/getTourCount", getTourCount)

// Get tours by category
router.get('/category/:categoryId', getToursByCategory)

export default router

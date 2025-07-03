import express from 'express'
import { createTour, deleteTour, getAllTour, getFeaturedTour, getSingleTour, getTourBySearch, getTourCount, updateTour } from '../Controllers/tourControllers.js'

import { verifyAdmin } from '../utils/verifyToken.js'

const router = express.Router()

//Create new tour 
router.post('/', createTour)

//Update tour 
router.put('/:id',  updateTour)

//Delete tour 
router.delete('/:id', deleteTour)

//Get single tour 
router.get('/:id', getSingleTour)

//Get all tour 
router.get('/', getAllTour)

//Get tour by search
router.get("/search/getTourBySearch", getTourBySearch)
router.get("/search/getFeaturedTour", getFeaturedTour)
router.get("/search/getTourCount", getTourCount)




export default router
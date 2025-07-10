import Category from '../models/Category.js'

// Create
export const createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body)
    const savedCategory = await newCategory.save()
    res.status(200).json({ success: true, message: 'Created category', data: savedCategory })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create category' })
  }
}

// Get All
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
    res.status(200).json({ success: true, data: categories })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' })
  }
}

// Update
export const updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    res.status(200).json({ success: true, message: 'Updated successfully', data: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update category' })
  }
}

// Delete
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete category' })
  }
}

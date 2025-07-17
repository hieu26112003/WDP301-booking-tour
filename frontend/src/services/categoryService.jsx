// src/services/categoryService.jsx
import axios from "axios";
import { BASE_URL } from "../utils/config";


export const getCategories = async () => {
  return await axios.get(`${BASE_URL}/categories`);
};

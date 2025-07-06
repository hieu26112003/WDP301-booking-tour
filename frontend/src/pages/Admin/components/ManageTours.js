import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageTours = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", price: "", categoryId: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchTours();
    fetchCategories();
  }, []);

  const fetchTours = async () => {
    const res = await axios.get("http://localhost:8000/api/tours");
    setTours(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8000/api/categories");
    setCategories(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`http://localhost:8000/api/tours/${editing._id}`, form);
    } else {
      await axios.post("http://localhost:8000/api/tours", form);
    }
    setForm({ title: "", price: "", categoryId: "" });
    setEditing(null);
    fetchTours();
  };

  const handleEdit = (tour) => {
    setEditing(tour);
    setForm({ title: tour.title, price: tour.price, categoryId: tour.categoryId });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/api/tours/${id}`);
    fetchTours();
  };

  return (
    <div className="container mt-4">
      <h2>Manage Tours</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col">
            <input
              type="text"
              placeholder="Title"
              className="form-control"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="col">
            <input
              type="number"
              placeholder="Price"
              className="form-control"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div className="col">
            <select
              className="form-select"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" type="submit">
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tours.map((tour, index) => {
            const category = categories.find((c) => c._id === tour.categoryId);
            return (
              <tr key={tour._id}>
                <td>{index + 1}</td>
                <td>{tour.title}</td>
                <td>{tour.price}</td>
                <td>{category?.name || "N/A"}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(tour)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tour._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ManageTours;

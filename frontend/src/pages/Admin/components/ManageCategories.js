import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8000/api/categories");
    setCategories(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`http://localhost:8000/api/categories/${editing._id}`, { name });
    } else {
      await axios.post("http://localhost:8000/api/categories", { name });
    }
    setName("");
    setEditing(null);
    fetchCategories();
  };

  const handleEdit = (category) => {
    setEditing(category);
    setName(category.name);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/api/categories/${id}`);
    fetchCategories();
  };

  return (
    <div className="container mt-4">
      <h2>Manage Categories</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            placeholder="Category Name"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {editing ? "Update" : "Create"}
        </button>
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat._id}>
              <td>{index + 1}</td>
              <td>{cat.name}</td>
              <td>
                <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(cat)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCategories;
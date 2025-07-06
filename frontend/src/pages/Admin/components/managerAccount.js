import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageAccounts = () => {
    const [users, setUsers] = useState([]);
    const [editUserId, setEditUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        fullname: "",
        phone: "",
        status: "active",
        role: "user",
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios
            .get("http://localhost:8000/api/admin/users", { withCredentials: true })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error("Failed to fetch users", err));
    };

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            axios
                .delete(`http://localhost:8000/api/admin/users/${userId}`, {
                    withCredentials: true,
                })
                .then(() => fetchUsers())
                .catch((err) => console.error("Failed to delete user", err));
        }
    };

    const handleEditClick = (user) => {
        setEditUserId(user._id);
        setEditFormData({
            fullname: user.fullname,
            phone: user.phone,
            status: user.status,
            role: user.role || "user",
        });
    };

    const handleCancelEdit = () => {
        setEditUserId(null);
        setEditFormData({
            fullname: "",
            phone: "",
            status: "active",
            role: "user",
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue =
            type === "checkbox" ? (checked ? "active" : "inactive") : value;

        setEditFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleUpdate = (userId) => {
        axios
            .put(`http://localhost:8000/api/admin/users/${userId}`, editFormData, {
                withCredentials: true,
            })
            .then(() => {
                fetchUsers();
                setEditUserId(null);
            })
            .catch((err) => console.error("Failed to update user", err));
    };

    const handleToggleStatus = (userId) => {
        axios
            .patch(
                `http://localhost:8000/api/admin/users/${userId}/toggle-status`,
                {},
                { withCredentials: true }
            )
            .then(() => fetchUsers())
            .catch((err) => console.error("Failed to toggle status", err));
    };

    return (
        <div className="container mt-4">
            <h2>Manage Accounts</h2>
            <table className="table table-bordered table-hover mt-3">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Fullname</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user, index) => (
                        <tr key={user._id}>
                            <td>{index + 1}</td>

                            {editUserId === user._id ? (
                                <>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullname"
                                            value={editFormData.fullname}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            name="status"
                                            checked={editFormData.status === "active"}
                                            onChange={handleInputChange}
                                        />{" "}
                                        {editFormData.status === "active" ? "Active" : "Inactive"}
                                    </td>
                                    <td>
                                        <select
                                            className="form-select"
                                            name="role"
                                            value={editFormData.role}
                                            onChange={handleInputChange}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                            <option value="user">User</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm me-2"
                                            onClick={() => handleUpdate(user._id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{user.fullname}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.status === "active" ? "Active" : "Inactive"}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handleEditClick(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-info btn-sm me-2"
                                            onClick={() => handleToggleStatus(user._id)}
                                        >
                                            Toggle Status
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageAccounts;

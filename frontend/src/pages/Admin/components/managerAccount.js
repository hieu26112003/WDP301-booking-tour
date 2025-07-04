// src/pages/ManageAccounts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageAccounts = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/admin/users", { withCredentials: true })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error("Failed to fetch users", err));
    }, []);

    return (
        <div className="container mt-4">
            <h2>Manage Accounts</h2>
            <table className="table table-bordered table-hover mt-3">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Fullname</th>
                        <th>Phone</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user, index) => (
                        <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>{user.fullname}</td>
                            <td>{user.phone}</td>
                            <td>{user.status ? "Active" : "Inactive"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageAccounts;

import User from "../models/User.js";

// GET /admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // ẩn password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// GET /admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
};

// POST /admin/users
export const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check existing user
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) return res.status(400).json({ error: "Username or email already exists" });

        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
};

// PUT /admin/users/:id
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User updated", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
};

// DELETE /admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};

// PATCH /admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.status = user.status === "active" ? "inactive" : "active";
        await user.save();

        res.json({ message: `User status updated to ${user.status}`, user });
    } catch (err) {
        res.status(500).json({ error: "Failed to toggle user status" });
    }
};

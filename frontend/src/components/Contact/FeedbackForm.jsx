import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        feedback: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, type: "feedback" }),
            });
            const data = await res.json();
            alert(data.message);
            setFormData({ name: "", phone: "", email: "", address: "", feedback: "" });
        } catch (err) {
            alert("Lỗi gửi phản hồi");
        }
    };

    return (
        <div className="card p-4 shadow-sm">
            <h4 className="mb-3 text-primary">Đóng góp ý kiến</h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Họ và tên"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="Điện thoại"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        name="address"
                        className="form-control"
                        placeholder="Địa chỉ"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <textarea
                        name="feedback"
                        className="form-control"
                        rows="4"
                        placeholder="Góp ý của bạn..."
                        value={formData.feedback}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                    Gửi phản hồi
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;

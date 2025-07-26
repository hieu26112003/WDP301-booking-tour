import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CallbackRequestForm = () => {
    const [phone, setPhone] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "callback", phone }),
            });
            const data = await res.json();
            alert(data.message);
            setPhone("");
        } catch (err) {
            alert("Lỗi gửi yêu cầu gọi lại");
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // chỉ giữ lại số
        setPhone(value);
    };

    return (
        <div className="card p-4 shadow-sm">
            <h4 className="text-success mb-2">Liên hệ càng sớm - Giá càng rẻ</h4>
            <p className="mb-3 text-muted">Để lại số điện thoại, chúng tôi sẽ gọi lại cho bạn sau ít phút!</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="tel"
                        className="form-control"
                        placeholder="Số điện thoại của tôi là..."
                        value={phone}
                        onChange={handlePhoneChange}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success w-100">
                    YÊU CẦU GỌI LẠI
                </button>
            </form>
        </div>
    );
};

export default CallbackRequestForm;

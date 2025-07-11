import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div style={{ width: "200px", backgroundColor: "#fff", padding: "10px", borderRight: "1px solid #ddd" }}>
            <h4>Nhân viên</h4>
            <Link to="/staff/chat">💬 Hộp thư</Link>
        </div>
    );
};

export default Sidebar;

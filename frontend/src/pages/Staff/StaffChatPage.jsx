import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import StaffChat from "./StaffChat";

const StaffChatPage = () => {
    const { user } = useContext(AuthContext);

    if (!user || user.role !== "staff") {
        return <p>❌ Bạn không có quyền truy cập.</p>;
    }

    return <StaffChat staffId={user._id} />; // ✅ Đảm bảo user._id có
};

export default StaffChatPage;

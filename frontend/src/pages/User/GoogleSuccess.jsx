import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const query = new URLSearchParams(window.location.search);
      const token = query.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      localStorage.setItem("accessToken", token); // thống nhất key
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (res.ok && result.success) {
          dispatch({ type: "LOGIN_SUCCESS", payload: result.data });

          if (result.data.role === "admin") {
            navigate("/admin");
          } else if (result.data.role === "staff") {
            navigate("/staff");
          } else {
            navigate("/home");
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Google login error:", error);
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [dispatch, navigate]);

  return <p>Đang đăng nhập...</p>;
}

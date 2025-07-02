import { createContext, useEffect, useReducer } from "react";
import { BASE_URL } from "../utils/config";

const initial_state = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  loading: false,
  error: null,
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case "REGISTER_SUCCESS":
      return {
        user: null,
        loading: false,
        error: null,
      };
    case "LOGOUT":
      localStorage.removeItem("user"); // Xóa user khỏi localStorage khi logout
      return {
        user: null,
        loading: false,
        error: null,
      };
    case "RESET_PASSWORD_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "RESET_PASSWORD_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
      };
    case "RESET_PASSWORD_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);

  // Kiểm tra token và khôi phục user khi tải trang
  useEffect(() => {
    const verifyToken = async () => {
      if (state.user) return; // Nếu đã có user, không cần kiểm tra lại

      try {
        const res = await fetch(`${BASE_URL}/auth/getCurrentUser`, {
          method: "GET",
          credentials: "include",
        });

        const result = await res.json();

        if (res.ok && result.success) {
          dispatch({ type: "LOGIN_SUCCESS", payload: result.data });
        } else {
          dispatch({ type: "LOGIN_FAILURE", payload: result.message });
          localStorage.removeItem("user");
        }
      } catch (err) {
        dispatch({ type: "LOGIN_FAILURE", payload: err.message });
        localStorage.removeItem("user");
      }
    };

    verifyToken();
  }, []);

  // Lưu user vào localStorage khi thay đổi
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

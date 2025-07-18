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
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
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
    case "UPDATE_PROFILE":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);

  useEffect(() => {
    const verifyToken = async () => {
      if (state.user) return;

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const res = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.success) {
          dispatch({ type: "LOGIN_SUCCESS", payload: result.data });
        } else {
          dispatch({ type: "LOGIN_FAILURE", payload: result.message });
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (err) {
        dispatch({ type: "LOGIN_FAILURE", payload: err.message });
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    };

    verifyToken();
  }, []);

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

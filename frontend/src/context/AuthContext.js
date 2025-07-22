import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
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

// Create an Axios instance for API requests
const api = axios.create({
  baseURL: BASE_URL,
});

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);

  // Axios interceptor to handle 401 errors and refresh token
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== "/auth/refresh-token"
        ) {
          originalRequest._retry = true; // Mark as retried to prevent infinite loops
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              dispatch({
                type: "LOGIN_FAILURE",
                payload: "No refresh token available",
              });
              localStorage.removeItem("user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              return Promise.reject(error);
            }

            const response = await axios.post(
              `${BASE_URL}/auth/refresh-token`,
              {
                refreshToken,
              }
            );

            if (response.data.success) {
              const newAccessToken = response.data.accessToken;
              localStorage.setItem("accessToken", newAccessToken);
              originalRequest.headers[
                "Authorization"
              ] = `Bearer ${newAccessToken}`;
              return api(originalRequest); // Retry the original request
            } else {
              dispatch({
                type: "LOGIN_FAILURE",
                payload: "Failed to refresh token",
              });
              localStorage.removeItem("user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error("Token refresh error:", refreshError);
            dispatch({
              type: "LOGIN_FAILURE",
              payload: "Failed to refresh token",
            });
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (state.user) return;

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data.success) {
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data.data });
        } else {
          dispatch({ type: "LOGIN_FAILURE", payload: res.data.message });
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
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

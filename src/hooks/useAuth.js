import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  logout as logoutAction,
} from "../features/auth/authSlice";
import { clearChat } from "../features/chat/chatSlice";
import { api } from "../services/api";
import { ROUTES } from "../utils/constants";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearChat());
    dispatch(api.util.resetApiState());
    navigate(ROUTES.LOGIN);
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
};

export default useAuth;

import { loginRequest } from "../../../config/api-config";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router";
import { useEffect } from "react";

function Login() {

  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  async function handleLogin(instance) {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    
    async function checkLogin() {
      if (accounts.length > 0) {
        return navigate('/');
      } else {
        await handleLogin(instance);
      }
    }

    checkLogin();

  }, []);
}

export default Login;

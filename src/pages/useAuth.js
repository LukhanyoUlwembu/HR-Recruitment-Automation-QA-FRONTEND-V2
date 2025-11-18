import { useMsal } from "@azure/msal-react";

// export const BASE_URL = "http://localhost:8080";
export const BASE_URL = "https://backend-5-offu.onrender.com";


export const loginRequest = {
  scopes: ["User.Read", "OnlineMeetings.ReadWrite"],
};

export function useAuth() {
  const { instance, accounts } = useMsal();

  // Check if user is logged in
  const isLoggedIn = accounts && accounts.length > 0;

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error("Login failed", e);
      throw e;
    }
  };

  const getAccessToken = async () => {
    if (!isLoggedIn) {
      await login();
    }
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: instance.getActiveAccount() || accounts[0],
      });
      return response.accessToken;
    // eslint-disable-next-line no-unused-vars
    } catch (silentError) {
      // fallback to interactive login
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error("Token acquisition failed", popupError);
        throw popupError;
      }
    }
  };

  const getAccount = () => {
    return instance.getActiveAccount() || (accounts && accounts[0]);
  };

  return { isLoggedIn, login, getAccessToken, getAccount };
}

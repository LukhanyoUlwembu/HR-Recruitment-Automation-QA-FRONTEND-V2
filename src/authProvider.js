import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig"; // your config

const msalInstance = new PublicClientApplication(msalConfig);

export const AuthProvider = ({ children }) => (
  <MsalProvider instance={msalInstance}>
    {children}
  </MsalProvider>
);
import { PublicClientApplication } from "@azure/msal-browser";


export const msalConfig = {
  auth: {
    clientId: "543e6776-91c0-48eb-bf30-b0a1bd2f0592", 
    authority: "https://login.microsoftonline.com/263f6167-9311-4dd0-88be-0a6ec8bed433", 
    redirectUri: "http://localhost:5173", 
  },
  cache: {
    cacheLocation: "localStorage", 
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Calendars.Read","User.Read.All", "OnlineMeetings.ReadWrite"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
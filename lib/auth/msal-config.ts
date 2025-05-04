import { type Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser"

// Configuração do MSAL
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: "http://localhost:3000",
    postLogoutRedirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
        }
      },
      logLevel: LogLevel.Info,
    },
  },
}

// Inicializa o MSAL
export const msalInstance = new PublicClientApplication(msalConfig)

// Escopos de login
export const loginRequest = {
  scopes: ["User.Read"],
}

// Escopos para o Graph API
export const graphRequest = {
  scopes: [
    "User.Read",
    "User.ReadBasic.All",
    "Sites.Read.All",
    "Sites.ReadWrite.All",
    "AllSites.Read",
    "AllSites.ReadWrite",
  ],
}

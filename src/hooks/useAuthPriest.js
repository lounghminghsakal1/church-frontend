import { createContext, useContext, useState } from "react";

const AuthPriestContext = createContext();

export function AuthPriestProvider({children}) {
  const [loggedInPriest, setLoggedInPriest] = useState(null);
  return (
    <AuthPriestContext.Provider value={{loggedInPriest, setLoggedInPriest}}>
      {children}
    </AuthPriestContext.Provider>
  );
}

export const useAuthPriest = () => {
  return useContext(AuthPriestContext);
}


import React, { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useContext(AuthContext);

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

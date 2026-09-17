import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  signInAsAdmin: () => {},
  signInAsTestUser: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

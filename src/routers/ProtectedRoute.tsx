import { Navigate, useLocation } from 'react-router-dom'
import { getStoredTokens, isTokenExpired } from '../apis/auth'

import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken } = getStoredTokens()
  const location = useLocation()

  if (!accessToken || isTokenExpired()) {
    // Redirect to login page with the intended destination
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

import { Navigate, useLocation } from 'react-router-dom'
import { getStoredTokens, isTokenExpired } from '../apis/auth'

import { ReactNode } from 'react'

interface PublicRouteProps {
  children: ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { accessToken } = getStoredTokens()
  const location = useLocation()

  if (accessToken && !isTokenExpired()) {
    // Redirect to the intended destination or default to list page
    console.log(location.state)
    const destination = '/list'
    return (
      <Navigate
        to={destination}
        replace
      />
    )
  }

  return children
}

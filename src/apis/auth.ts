import { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import {
  ACCESS_TOKEN_COOKIE,
  CLIENT_ID,
  CLIENT_SECRET,
  ORG_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  TOKEN_EXPIRY_COOKIE
} from '../environments'
import { authClient, apiClient } from './general'

// Types
export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: string
}

export interface UserProfile {
  data?: {
    memberships?: Array<{
      token: string
      organisationId: string
    }>
  }
}

export interface TokenData {
  accessToken: string
  refreshToken: string
  orgToken: string
  expiresAt: number
}

interface ApiError {
  message: string
  code?: string
  status?: number
}

// Token management
export const setTokens = (tokenData: Partial<TokenData>) => {
  const { accessToken, refreshToken, expiresAt, orgToken } = tokenData

  if (accessToken) {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken)
    authClient.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${accessToken}`
  }

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken)
  }

  if (orgToken) {
    Cookies.set(ORG_TOKEN_COOKIE, orgToken)
    authClient.defaults.headers.common['org-token'] = orgToken
  }

  if (expiresAt) {
    Cookies.set(TOKEN_EXPIRY_COOKIE, expiresAt.toString())
  }
}

export const getStoredTokens = (): TokenData => ({
  accessToken: Cookies.get(ACCESS_TOKEN_COOKIE) || '',
  refreshToken: Cookies.get(REFRESH_TOKEN_COOKIE) || '',
  orgToken: Cookies.get(ORG_TOKEN_COOKIE) || '',
  expiresAt: Number(Cookies.get(TOKEN_EXPIRY_COOKIE)) || 0
})

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE)
  Cookies.remove(REFRESH_TOKEN_COOKIE)
  Cookies.remove(ORG_TOKEN_COOKIE)
  Cookies.remove(TOKEN_EXPIRY_COOKIE)

  delete authClient.defaults.headers.common['Authorization']
  delete authClient.defaults.headers.common['org-token']
}

export const isTokenExpired = (): boolean => {
  const { expiresAt } = getStoredTokens()
  console.log('isExpired', Date.now() >= expiresAt - 60 * 1000)
  return Date.now() >= expiresAt - 60 * 1000 // Check if expires in less than 1 minute
}

// API functions
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    '/oauth2/token',
    new URLSearchParams({
      client_id: 'v3V87ZIqjdUMnQlf4yv7eW3k1aAa',
      client_secret: 'DXhnQ6TcE_wisvn6mWqAUqJrtpQa',
      grant_type: 'password',
      scope: 'openid',
      username,
      password
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  const expiresAt = Date.now() + response.data.expires_in * 1000

  setTokens({
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    expiresAt
  })
  await getUserProfile()
  return response.data
}

export const refreshTokens = async (): Promise<boolean> => {
  try {
    const { refreshToken } = getStoredTokens()

    if (!refreshToken) {
      return false
    }

    const response = await apiClient.post<LoginResponse>(
      '/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const expiresAt = Date.now() + response.data.expires_in * 1000

    await getUserProfile()

    setTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt
    })

    // Re-fetch user profile to get fresh org token

    return true
  } catch (error) {
    clearTokens()
    return false
  }
}

export const getUserProfile = async (): Promise<{
  data?: {
    memberships?: Array<{
      token: string
      organisationId: string
    }>
  }
  error?: ApiError
}> => {
  try {
    const response = await authClient.get<UserProfile>(
      '/membership-service/1.0.0/users/me',
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    // Parse and validate response data
    const userData = response.data.data
    if (!userData) {
      throw new Error('Invalid response format')
    }

    // Check and set org token if memberships exist
    debugger
    if (userData.memberships && userData.memberships.length > 0) {
      const orgToken = userData.memberships[0].token
      if (orgToken) {
        setTokens({ orgToken })
      } else {
        console.warn('Organization token not found in membership data')
      }
    } else {
      console.warn('No memberships found in user profile')
    }

    return { data: { memberships: userData.memberships } }
  } catch (error) {
    console.error('Error fetching user profile:', error)

    // Type guard for axios error
    if ((error as AxiosError)?.response?.data) {
      return {
        error: {
          message:
            (error as AxiosError<{ message: string }>)?.response?.data
              ?.message || 'Failed to fetch user profile',
          code: (error as AxiosError<{ message: string; code?: string }>)
            .response?.data?.code,
          status: (error as AxiosError).response?.status
        }
      }
    }

    // Handle network or other errors
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: 500
      }
    }
  }
}

// Add request interceptor for token refresh
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

authClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isTokenExpired() && !config.url?.includes('oauth2/token')) {
      if (!isRefreshing) {
        isRefreshing = true
        const refreshSuccess = await refreshTokens()
        isRefreshing = false

        if (refreshSuccess) {
          const { accessToken } = getStoredTokens()
          onTokenRefreshed(accessToken)
        } else {
          refreshSubscribers = []
          throw new Error('Token refresh failed')
        }
      }

      return new Promise(resolve => {
        subscribeTokenRefresh((token: string) => {
          config.headers.Authorization = `Bearer ${token}`
          resolve(config)
        })
      })
    }
    return config
  },
  error => Promise.reject(error)
)

// Add response interceptor for handling auth errors
authClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearTokens()
      // You might want to trigger a logout event here
    }
    return Promise.reject(error)
  }
)

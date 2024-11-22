import { API_URL } from '../environments'
import { clearTokens, getStoredTokens, isTokenExpired } from './auth'
import { useNavigate } from 'react-router-dom'
export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  status: Array<{
    key: string
    value: boolean
  }>
  currency: string
  currencySymbol?: string
  totalAmount: number
  customer: {
    firstName: string
    lastName: string
    contact: {
      email: string
      mobileNumber: string
    }
  }
}

export interface CreateInvoicePayload {
  invoices: Array<{
    bankAccount: {
      bankId?: string
      sortCode: string
      accountNumber: string
      accountName: string
    }
    customer: {
      firstName: string
      lastName: string
      contact: {
        email: string
        mobileNumber: string
      }
      addresses: Array<{
        premise: string
        countryCode: string
        postcode: string
        county: string
        city: string
        addressType: string
      }>
    }
    documents: Array<{
      documentId: string
      documentName: string
      documentUrl: string
    }>
    invoiceReference: string
    invoiceNumber: string
    currency: string
    invoiceDate: string
    dueDate: string
    description: string
    customFields: Array<{
      key: string
      value: string
    }>
    extensions: Array<{
      addDeduct: 'ADD' | 'DEDUCT'
      value: number
      type: 'PERCENTAGE' | 'FIXED_VALUE'
      name: string
    }>
    items: Array<{
      itemReference: string
      description: string
      quantity: number
      rate: number
      itemName: string
      itemUOM: string
      customFields: Array<{
        key: string
        value: string
      }>
      extensions: Array<{
        addDeduct: 'ADD' | 'DEDUCT'
        value: number
        type: 'PERCENTAGE' | 'FIXED_VALUE'
        name: string
      }>
    }>
  }>
}

export interface SearchParams {
  pageNum?: number
  pageSize?: number
  sortBy?: string
  ordering?: 'ASCENDING' | 'DESCENDING'
  keyword?: string
}

interface PagingData {
  totalRecords: number
  pageSize: number
  pageNum: number
  totalPages: number
}

interface ApiResponse {
  data?: any[]
  paging?: PagingData
  error?: string
}

export const fetchInvoiceList = async (
  searchParams: SearchParams,
  navigate: ReturnType<typeof useNavigate>
): Promise<ApiResponse> => {
  try {
    // Check if token is expired
    if (isTokenExpired()) {
      clearTokens()
      navigate('/login')
      return { error: 'Session expired' }
    }

    // Get tokens
    const { accessToken, orgToken } = getStoredTokens()
    debugger
    // Verify tokens exist
    if (!accessToken || !orgToken) {
      clearTokens()
      navigate('/login')
      return { error: 'Authentication required' }
    }

    // Default values for search params
    const {
      pageNum = 1,
      pageSize = 10,
      sortBy = 'CREATED_DATE',
      ordering = 'DESCENDING',
      keyword = ''
    } = searchParams

    // Build query parameters
    const queryParams = new URLSearchParams({
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      ordering,
      ...(keyword && { keyword })
    })

    // Make API request
    const response = await fetch(
      `${API_URL}/invoice-service/1.0.0/invoices?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'org-token': orgToken
        }
      }
    )

    // Handle response
    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        clearTokens()
        navigate('/login')
        return { error: 'Session expired' }
      }

      // Handle other errors
      throw new Error(`Failed to fetch invoices: ${response.statusText}`)
    }

    // Parse and return response
    const data = await response.json()
    return {
      data: data.data,
      paging: data.paging
    }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

export const createInvoice = async (
  invoice: Invoice,
  accessToken: string,
  orgToken: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/invoice-service/1.0.0/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Operation-Mode': 'SYNC',
        'org-token': orgToken
      },
      body: JSON.stringify({ invoices: [invoice] })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}

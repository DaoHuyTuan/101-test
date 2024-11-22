import axios from 'axios'
import { API_URL, BASE_URL } from '../environments'

// API Client setup

export const apiClient = axios.create({
  baseURL: BASE_URL
})

export const authClient = axios.create({
  baseURL: API_URL
})

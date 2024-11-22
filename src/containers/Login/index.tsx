import { Button } from '../../components/Button'
import React, { useState } from 'react'
import { z } from 'zod'
import { login } from '../../apis/auth'
import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/auth-context';

// Define validation schema
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
})

// Type for form values
type LoginFormValues = z.infer<typeof loginSchema>

// Type for form errors
type FormErrors = {
  [K in keyof LoginFormValues]?: string
}
export const Login = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState<LoginFormValues>({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = (field: keyof LoginFormValues, value: string) => {
    try {
      // @ts-ignore
      loginSchema.pick({ [field]: true }).parse({ [field]: value })
      setErrors(prev => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0].message
        }))
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    validateField(name as keyof LoginFormValues, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate all fields
      const validatedData = loginSchema.parse(values)

      setIsLoading(true)
      await login(validatedData.username, validatedData.password)

      // Clear form after successful login
      // setValues({ username: '', password: '' })
      setErrors({})
      navigate('/list')
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to form fields
        const newErrors: FormErrors = {}
        error.errors.forEach(err => {
          const field = err.path[0] as keyof LoginFormValues
          newErrors[field] = err.message
        })
        setErrors(newErrors)
      } else {
        // Handle API errors
        console.error('Login failed:', error)
        setErrors({
          username: 'Login failed. Please check your credentials.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-[400px] flex-col items-center gap-[30px] p-4 rounded-[10px] border-[1px] border-black">
      <span className="font-bold">Login</span>
      <form
        onSubmit={handleSubmit}
        className="flex w-[400px] flex-col items-center gap-[30px] p-4">
        <div className="w-full">
          <input
            name="username"
            value={values.username}
            onChange={handleChange}
            className={`border-[1px] ${
              errors.username ? 'border-red-500' : 'border-black'
            } w-full p-2 rounded-[5px]`}
            placeholder="username"
          />
          {errors.username && (
            <span className="text-red-500 text-sm mt-1">{errors.username}</span>
          )}
        </div>
        <div className="w-full">
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            className={`border-[1px] ${
              errors.password ? 'border-red-500' : 'border-black'
            } w-full p-2 rounded-[5px]`}
            placeholder="password"
          />
          {errors.password && (
            <span className="text-red-500 text-sm mt-1">{errors.password}</span>
          )}
        </div>
        <Button
          type="submit"
          clss="flex justify-center bg-black text-white border-[1px] border-black hover:bg-[white] hover:text-black px-4 py-2 rounded-md w-full"
          label="Login"
          loading={isLoading}
        />
      </form>
    </div>
  )
}

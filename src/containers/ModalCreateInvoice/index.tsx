// components/SimpleInvoiceModal.tsx
import React, { useCallback, useState } from 'react'
import { getStoredTokens } from '../../apis/auth'
import { API_URL } from '../../environments'

interface SimpleInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  // onSubmit: (invoiceData: any) => void
}

export const ModalCreateInvoice: React.FC<SimpleInvoiceModalProps> = ({
  isOpen,
  onClose
  // onSubmit
}) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    // amount: '',
    description: '',
    dueDate: ''
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const { accessToken, orgToken } = getStoredTokens()
      // Create the invoice object according to the API structure
      const invoiceData = {
        bankAccount: {
          bankId: '',
          sortCode: '09-01-01',
          accountNumber: '12345678',
          accountName: 'John Terry'
        },
        customer: {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          contact: {
            email: 'customer@example.com',
            mobileNumber: '+1234567890'
          },
          addresses: [
            {
              premise: 'N/A',
              countryCode: 'US',
              postcode: '12345',
              county: 'N/A',
              city: 'N/A',
              addressType: 'BILLING'
            }
          ]
        },
        invoiceNumber: `INV${Date.now()}`,
        currency: 'USD',
        // invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate,
        description: formData.description,
        customFields: [],
        extensions: [],
        items: [
          {
            itemReference: 'ITEM1',
            description: formData.description,
            quantity: 1,
            // rate: parseFloat(formData.amount),
            itemName: 'Service',
            itemUOM: 'UNIT',
            customFields: [],
            extensions: []
          }
        ]
      }
      debugger
      try {
        const response = await fetch(
          `${API_URL}/invoice-service/1.0.0/invoices`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
              'Operation-Mode': 'SYNC',
              'org-token': orgToken
            },
            body: JSON.stringify({ invoices: [invoiceData] })
          }
        )

        if (!response.ok) {
          debugger
          throw new Error('Failed to create invoice')
        }

        // onSubmit(invoiceData)
        onClose()
        alert('Invoice created successfully!')
      } catch (error) {
        console.error('Error creating invoice:', error)
        alert('Failed to create invoice. Please try again.')
      }
    },
    [formData, onClose]
  )
  console.log('formData', formData)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="flex flex-row gap-[20px]">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-blue-700">
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import { useNavigate } from 'react-router-dom'
import { fetchInvoiceList, SearchParams } from '../../apis/invoices'
import { ModalCreateInvoice } from '../ModalCreateInvoice'
import { Pagination } from '../../components/Pagination'

// Types for invoice data
interface Invoice {
  id: string
  invoiceNumber: string
  customer: {
    firstName: string
    lastName: string
    contact: {
      email: string
      mobileNumber: string
    }
  }
  currency: string
  invoiceDate: string
  dueDate: string
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  totalAmount: number
  description: string
}

// Example usage with DataTable component
export const List = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  // @ts-ignore
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    pageNum: 1,
    pageSize: 10,
    sortBy: 'CREATED_DATE',
    ordering: 'DESCENDING',
    keyword: ''
  })
  const [totalRecords, setTotalRecords] = useState(0)

  const handleFetchInvoices = useCallback(async () => {
    const queryParams = {
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
      sortBy: searchParams.sortBy,
      ordering: searchParams.ordering,
      ...(searchParams.keyword && { keyword: searchParams.keyword })
    }
    const result = await fetchInvoiceList(queryParams, navigate)
    if (result.error) {
      setError(result.error)
    } else {
      if (result.data) {
        setInvoices(result.data)
      } else {
        setInvoices([])
      }
      setTotalRecords(result.paging ? result.paging.totalRecords : 0)
    }
  }, [searchParams])

  useEffect(() => {
    handleFetchInvoices()
  }, [searchParams]) // Refetch when search parameters change

  const columns: {
    key: keyof Invoice
    label: string
    sortable?: boolean
    render?: (value: any, row: Invoice) => React.ReactNode
  }[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (customer: Invoice['customer']) =>
        `${customer?.firstName ? customer.firstName : '-'} ${
          customer?.lastName ? customer.lastName : '-'
        }`
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      sortable: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (amount: number, invoice: Invoice) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: invoice.currency
        }).format(amount)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (status: Array<{ key: string; value: boolean }>) => (
        <div className="flex justify-end">
          <span
            className={`w-full flex justify-center px-2 py-1 rounded-full text-xs font-medium ${
              status[0].key === 'Due'
                ? 'bg-green-100 text-green-800'
                : status[0].key === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
            {status[0].key}
          </span>
        </div>
      )
    }
  ]

  const filters: {
    key: keyof Invoice
    label: string
    options: { label: string; value: any }[]
  }[] = [
    {
      key: 'status',
      label: 'Filter by Status',
      options: [
        { label: 'Due', value: 'Due' },
        { label: 'Overdue', value: 'Overdue' }
      ]
    },
    {
      key: 'currency',
      label: 'Filter by Currency',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'GBP', value: 'GBP' }
      ]
    }
  ]
  console.log('invoices', invoices)
  return (
    <div className="flex flex-col gap-[20px] w-full p-[20px]">
      <div className="flex items-center w-full justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button
          label="Create"
          onClick={() => setIsModalOpen(true)}
          clss="bg-black border-[1px] border-black px-5 py-1 text-white rounded-md"
        />
      </div>
      <DataTable
        data={invoices}
        columns={columns}
        searchable={true}
        searchKeys={['invoiceNumber', 'customer', 'description']}
        filters={filters}
      />
      <Pagination
        currentPage={searchParams.pageNum || 0}
        itemsPerPage={searchParams.pageSize || 0}
        totalItems={totalRecords}
        onItemsPerPageChange={itemsPerPage => {
          setSearchParams(curr => ({ ...curr, pageSize: itemsPerPage }))
        }}
        onPageChange={newPage => {
          setSearchParams(curr => ({ ...curr, pageNum: newPage }))
        }}
      />
      <ModalCreateInvoice
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // onSubmit={handleSubmit}
      />
    </div>
  )
}

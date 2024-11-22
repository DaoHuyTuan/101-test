import React, { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ChevronDown } from 'lucide-react'
import { ModalDetailInvoice } from '../../containers/ModalDetailInvoice'
import { Invoice } from '../../apis/invoices'

// Types
type SortDirection = 'asc' | 'desc' | null

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchKeys?: (keyof T)[]
  filters?: {
    key: keyof T
    label: string
    options: { label: string; value: any }[]
  }[]
}

export const DataTable = <T extends { [key: string]: any }>({
  data = [], // Provide default empty array
  columns,
  searchable = true,
  searchKeys,
  filters = []
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | undefined>()
  const [isOpenDetail, setIsOpenDetail] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: SortDirection
  }>({
    key: null,
    direction: null
  })
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  // Handle sorting
  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction:
        current.key === key
          ? current.direction === 'asc'
            ? 'desc'
            : current.direction === 'desc'
            ? null
            : 'asc'
          : 'asc'
    }))
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // Check if data is empty
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    let processed = [...data]

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'status') {
          processed = processed.filter(item =>
            item[key].some(
              (status: { key: string; value: boolean }) => status.key === value
            )
          )
        } else {
          processed = processed.filter(
            item => String(item[key]) === String(value)
          )
        }
      }
    })

    // Apply search
    if (searchTerm && searchKeys) {
      processed = processed.filter(item =>
        searchKeys.some(key =>
          String(item[key] || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      let aValue
      let bValue
      processed.sort((a, b) => {
        if (sortConfig.key === 'status') {
          aValue = a[sortConfig.key!][0].key
          bValue = b[sortConfig.key!][0].key
        }
        debugger
        aValue = a[sortConfig.key!]
        bValue = b[sortConfig.key!]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return processed
  }, [data, searchTerm, sortConfig, activeFilters, searchKeys])

  // If no data provided, show empty state
  if (!Array.isArray(data)) {
    return (
      <div className="text-center py-8 text-gray-500">No data available</div>
    )
  }

  console.log('filteredAndSortedData', filteredAndSortedData)
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        {searchable && searchKeys && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <div
                key={String(filter.key)}
                className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={activeFilters[String(filter.key)] || ''}
                  onChange={e =>
                    setActiveFilters(curr => ({
                      ...curr,
                      [filter.key]: e.target.value || null
                    }))
                  }>
                  <option value="">{filter.label}</option>
                  {filter.options.map(option => (
                    <option
                      key={option.value}
                      value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 h-[500px]">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-end gap-2">
                    {column.label}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="hover:bg-gray-100 p-1 rounded">
                        <ArrowUpDown
                          className={`h-4 w-4 ${
                            sortConfig.key === column.key
                              ? 'text-blue-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.map((item: any, index) => (
              <tr
                key={index}
                onClick={() => {
                  setIsOpenDetail(true)
                  setCurrentInvoice(item)
                }}
                className="hover:bg-gray-50 transition-colors duration-150">
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No results message */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-3 text-gray-500">No results found</div>
      )}
      <ModalDetailInvoice
        invoice={currentInvoice}
        isOpen={isOpenDetail}
        onClose={() => setIsOpenDetail(false)}
      />
    </div>
  )
}

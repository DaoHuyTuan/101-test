import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
interface Props {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

export const Pagination = (props: Props) => {
  const [pageNumber, setPageNumber] = useState(props.currentPage)
  const totalPages = Math.ceil(props.totalItems / props.itemsPerPage)
  const startItem = (pageNumber - 1) * props.itemsPerPage + 1
  const endItem = Math.min(pageNumber * props.itemsPerPage, props.totalItems)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage)
      props.onPageChange?.(newPage)
    }
  }

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(event.target.value)
    props.onItemsPerPageChange?.(newItemsPerPage)
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={props.itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-1 border rounded-md">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {props.totalItems} entries
        </div>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="flex items-center px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
        </div>

        <div className="text-sm">
          Page {pageNumber} of {totalPages}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            className="flex items-center px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

import { Invoice } from '../../apis/invoices'

interface Props {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | undefined
}
export const ModalDetailInvoice = (props: Props) => {
  if (!props.isOpen) return null
  console.log(props.invoice)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Invoice {props.invoice?.invoiceNumber}
          </h2>
          <button
            onClick={props.onClose}
            className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Invoice Date</p>
              <p className="font-medium">{props.invoice?.invoiceDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{props.invoice?.dueDate}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <p>
              {props.invoice?.customer?.firstName}{' '}
              {props.invoice?.customer?.lastName}
            </p>
            <p>{props.invoice?.customer?.contact?.email}</p>
            <p>{props.invoice?.customer?.contact?.mobileNumber}</p>
          </div>
          <div className="border-t pt-4 flex">
            <div className="flex flex-1 flex-col">
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <span
                  className={`justify-center px-2 py-1 rounded-full text-xs font-medium ${
                    props?.invoice?.status[0].key === 'Due'
                      ? 'bg-green-100 text-green-800'
                      : props?.invoice?.status[0].key === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {props?.invoice?.status[0].key}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col">
              <h3 className="font-semibold mb-2">Amount</h3>
              <span>
                {props.invoice?.totalAmount}
                {props.invoice?.currencySymbol}
              </span>
            </div>
          </div>

          {/* <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Items</h3>
            {props.invoice?.items?.map((item, index) => (
              <div
                key={index}
                className="mb-2">
                <p className="font-medium">{item.itemName}</p>
                <p>{item.description}</p>
                <p>
                  Quantity: {item.quantity} {item.itemUOM}
                </p>
                <p>
                  Rate: {item.rate} {props.invoice.currency}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Bank Account</h3>
            <p>Account: {props.invoice?.bankAccount?.accountName}</p>
            <p>Number: {props.invoice?.bankAccount?.accountNumber}</p>
            <p>Sort Code: {props.invoice?.bankAccount?.sortCode}</p>
          </div> */}
        </div>
      </div>
    </div>
  )
}

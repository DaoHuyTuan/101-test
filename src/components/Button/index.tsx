import { LoaderCircle } from 'lucide-react'

interface ButtonProps {
  label: string
  loading?: boolean
  clss?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
export const Button = (props: ButtonProps) => {
  return (
    <button
      className={props.clss}
      type={props.type}
      onClick={props.onClick}>
      {props.loading ? <LoaderCircle className="animate-spin" /> : props.label}
    </button>
  )
}

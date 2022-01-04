import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import PrimaryButton from '../PrimaryButton/PrimaryButton'
import './styles.scss'

export type InputTextFieldProps = {
  label?: string
  placeholder?: string
  textarea?: boolean
  disabled?: boolean
  hidden?: boolean
  autoUpdate?: boolean
  className?: string
  buttonName?: string
  edit?: boolean
  type?: 'text' | 'password' | 'email' | 'number' | 'url'
  error?: ReactNode
  displayMode?: boolean
  value?: string | undefined | null
  getText?(text: string): void
  textAreaAttrs?: React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
  inputAttrs?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
  textAreaAutoSize?: boolean
  highlightWhenEmpty?: boolean
  highlight?: boolean
}

export const InputTextField: FC<InputTextFieldProps> = ({
  label,
  placeholder,
  textarea,
  disabled,
  hidden,
  autoUpdate,
  className,
  error,
  edit,
  type,
  displayMode,
  value,
  buttonName,
  getText,
  inputAttrs,
  textAreaAttrs,
  textAreaAutoSize,
  highlightWhenEmpty,
  highlight,
}) => {
  const [text, setText] = useState<string | undefined | null>(value)
  const [errorLeaves, setErrorLeave] = useState<boolean>(false)
  const [currentError, setcurrentError] = useState<ReactNode>(undefined)
  const [rows, setRows] = useState<number>(textAreaAutoSize ? 1 : 5)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const textArea = useRef<HTMLTextAreaElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const checkRowChange = useCallback(() => {
    if (textAreaAutoSize && textArea && textArea.current) {
      textArea.current.style.height = 'fit-content'
      // console.log(textArea.current.scrollHeight)
      textArea.current.style.height =
        Math.ceil(textArea.current.scrollHeight / 10) * 10 + 'px'
    }
  }, [textAreaAutoSize])

  const handleKeyDown = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter') {
      getText && getText(text ? text : '')
    }
    setRows(rows)
  }

  const handleClick = () => {
    getText && getText(text ? text : '')
  }

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setText(e.currentTarget.value)
    autoUpdate && getText && getText(e.currentTarget.value)
  }

  useEffect(() => {
    textArea && checkRowChange()
  }, [text, checkRowChange])

  useEffect(() => {
    setText(value)
  }, [value])

  useEffect(() => {
    if (error) {
      setErrorLeave(false)
      setcurrentError(error)
    } else {
      if (currentError) {
        setErrorLeave(true)
        setTimeout(() => {
          setcurrentError(undefined)
        }, 500)
      } else {
        setcurrentError(undefined)
      }
    }
  }, [error, setErrorLeave, currentError])

  return (
    <div
      className={`input-text-field ${className}${disabled ? ' disabled' : ''} ${
        (highlightWhenEmpty && !text) || highlight || error ? ' highlight' : ''
      } ${!errorLeaves && error ? 'enter-error' : ''} ${
        errorLeaves ? 'leave-error' : ''
      } ${isFocused ? 'focused' : ''}`}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      hidden={hidden}
    >
      {label ? <label>{label}</label> : <></>}
      <div
        className={`input-text-field-container ${
          textarea ? 'textarea-container' : 'input-container'
        }  ${displayMode && 'display-mode'} ${!edit && 'not-editing'}`}
      >
        {textarea ? (
          <textarea
            ref={textArea}
            className={`${displayMode && 'display-mode'} ${
              !edit && 'not-editing'
            }`}
            value={text ? text : ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || !edit}
            placeholder={placeholder}
            name="textarea"
            cols={40}
            rows={rows}
            {...textAreaAttrs}
          />
        ) : (
          <input
            ref={input}
            className={`${displayMode && 'display-mode'} ${
              !edit && 'not-editing'
            }`}
            value={text ? text : ''}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...(buttonName && { onKeyDown: handleKeyDown })}
            disabled={disabled || !edit}
            type={type}
            placeholder={placeholder}
            {...inputAttrs}
          />
        )}
        {buttonName && (
          <PrimaryButton onClick={handleClick}>{buttonName}</PrimaryButton>
        )}
      </div>
      {currentError && !disabled && (
        <div className={`error-msg`}>{currentError}</div>
      )}
    </div>
  )
}

InputTextField.defaultProps = {
  hidden: false,
  displayMode: false,
  placeholder: '',
  value: '',
  className: '',
  edit: true,
  getText: () => '',
  textAreaAutoSize: false,
  type: 'text',
}

export default InputTextField

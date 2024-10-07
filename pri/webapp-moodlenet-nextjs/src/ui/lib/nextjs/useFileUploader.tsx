import { useCallback, useEffect, useRef, useState } from 'react'

export type fileUploadAction = (form: FormData) => Promise<{ fileUrl: string }>
useFileUploader.type = { image: '.jpg,.jpeg,.png,.gif', any: '*' }
export function useFileUploader({
  currentSrc,
  action,
  name = 'file',
  accept = useFileUploader.type.any,
  maxSize = 16777216, //16MB Math.pow(2,24)
}: {
  currentSrc: string
  action: fileUploadAction
  maxSize?: number
  name?: string
  accept?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  // TODO: this complex state management definitely deserves a useReducer ;)
  // NOTE: that would remove all (or most of) the useEffects !
  // NOTE: and make the whole logic simple and understandable
  const [currentSrcCache, setCurrentSrcCache] = useState(currentSrc)
  const [latestUpdatedSrc, setLatestUpdatedSrc] = useState(currentSrc)
  const [localSrc, setLocalSrc] = useState(currentSrc)
  const [error, setError] = useState('')
  const [choosenFile, setChoosenFile] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => {
    // align all srcs to the currentSrc when it changes
    setCurrentSrcCache(currentSrc)
    setLatestUpdatedSrc(currentSrc)
    setLocalSrc(currentSrc)
    inputRef.current && (inputRef.current.value = '')
  }, [currentSrc])
  useEffect(() => {
    // align localSrc when user has choosen a valid file (choosenFile)
    if (!choosenFile) {
      setLocalSrc(latestUpdatedSrc)
      return
    }
    setLocalSrc(choosenFile.url)
    return () => {
      URL.revokeObjectURL(choosenFile.url)
    }
  }, [choosenFile, currentSrcCache, latestUpdatedSrc])
  useEffect(() => {
    // create input element for file upload
    // append it to the body
    // update it when configs changes ( accept, maxSize )
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.accept = accept
    inputElement.hidden = true
    inputElement.multiple = false
    inputElement.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > maxSize) {
          setError('File size exceeds the limit')
          return
        }
        setError('')
        const url = URL.createObjectURL(file)
        setChoosenFile({ file, url })
      } else {
        setChoosenFile(null)
      }
    }
    inputRef.current = inputElement
    document.body.append(inputElement)
    return () => {
      // remove it from the body
      inputRef.current = null
      document.body.removeChild(inputElement)
    }
  }, [accept, maxSize])
  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])
  const dirty = !!choosenFile
  const submit = useCallback(() => {
    if (!dirty) return
    const formData = new FormData()
    formData.append(name, choosenFile.file)
    action(formData).then(({ fileUrl }) => {
      inputRef.current && (inputRef.current.value = '')
      setLatestUpdatedSrc(fileUrl)
      setChoosenFile(null)
    })
  }, [action, choosenFile?.file, dirty, name])
  return [openFileDialog, submit, error, localSrc, latestUpdatedSrc, dirty] as const
}



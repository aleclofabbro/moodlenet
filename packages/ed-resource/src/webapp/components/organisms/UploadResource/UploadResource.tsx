import { InsertDriveFile, Link as LinkIcon } from '@material-ui/icons'
import {
  getPreviewFromUrl,
  ImageContainer,
  InputTextField,
  PrimaryButton,
  RoundButton,
} from '@moodlenet/component-library'
import { FormikHandle, useImageUrl } from '@moodlenet/react-app/ui'
// import prettyBytes from 'pretty-bytes'
import { default as React, FC, useCallback, useEffect, useRef, useState } from 'react'
// import { withCtrl } from '../../../../lib/ctrl'
// import { SelectOptions } from '../../../../lib/types'
// import { useImageUrl } from '../../../../lib/useImageUrl'
import { ReactComponent as UploadFileIcon } from '../../../assets/icons/upload-file.svg'
import { ReactComponent as UploadImageIcon } from '../../../assets/icons/upload-image.svg'

// import InputTextField from '../../../atoms/InputTextField/InputTextField'
// import Modal from '../../../atoms/Modal/Modal'
// import PrimaryButton from '../../../atoms/PrimaryButton/PrimaryButton'
// import RoundButton from '../../../atoms/RoundButton/RoundButton'
// import SecondaryButton from '../../../atoms/SecondaryButton/SecondaryButton'
// import { VisibilityDropdown } from '../../../atoms/VisibilityDropdown/VisibilityDropdown'
// import { useNewResourcePageCtx } from '../NewResource'
// import { NewResourceFormValues } from '../types'
import './UploadResource.scss'

// type SubStep = 'AddFileOrLink' | 'AddImage'
export type UploadResourceProps = {
  fileMaxSize: number | null
  contentForm: FormikHandle<{ content: File | string | null }>
  contentUrl: string | null
  imageForm: FormikHandle<{ image: File | null }>
  imageUrl: string | null
  downloadFilename: string | null
  uploadProgress?: number
  imageOnClick?(): unknown
}

// const usingFields: (keyof NewResourceFormValues)[] = [
//   'name',
//   'description',
//   'category',
//   'license',
//   'visibility',
//   'image',
//   'content',
// ]

export const UploadResource: FC<UploadResourceProps> = ({
  fileMaxSize,
  contentForm,
  contentUrl,

  imageUrl,
  imageForm,
  downloadFilename,

  uploadProgress,
  imageOnClick,
}) => {
  // const { nextForm, form } = useNewResourcePageCtx()
  // const isValid = usingFields.reduce(
  //   (valid, fldName) => valid && !form.errors[fldName],
  //   true
  // )

  const [image] = useImageUrl(imageUrl, imageForm.values.image)

  const contentIsFile = contentForm.values.content instanceof File
  const contentName = downloadFilename
    ? downloadFilename
    : contentForm.values.content instanceof File
    ? contentForm.values.content.name
    : contentForm.values.content ?? contentUrl ?? ''

  const [shouldShowErrors, setShouldShowErrors] = useState<boolean>(false)
  // const [isToDelete, setIsToDelete] = useState<boolean>(false)
  const [isToDrop, setIsToDrop] = useState<boolean>(false)

  const [subStep, setSubStep] = useState<'AddFileOrLink' | 'AddImage'>(
    contentForm.values.content && !contentForm.errors.content ? 'AddImage' : 'AddFileOrLink',
  )

  const [deleteFileLinkPressed, setDeleteFileLinkPressed] = useState(false)

  const contentAvailable = !!(contentUrl || contentForm.values.content)
  const imageAvailable = !!(imageUrl || imageForm.values.image)

  useEffect(() => {
    if (deleteFileLinkPressed) {
      setShouldShowErrors(false)
      setDeleteFileLinkPressed(false)
    }
    contentForm.values.content && !contentForm.errors.content && setShouldShowErrors(false)

    setSubStep(
      (contentForm.values.content || contentUrl) && !contentForm.errors.content
        ? 'AddImage'
        : 'AddFileOrLink',
    )
  }, [
    contentForm,
    deleteFileLinkPressed,
    subStep,
    contentUrl,
    setSubStep,
    setDeleteFileLinkPressed,
  ])

  const addLinkFieldRef = useRef<HTMLInputElement>()

  const addLink = () => {
    contentForm
      .setFieldValue('content', addLinkFieldRef.current?.value, true)
      .then(_ => setShouldShowErrors(!!_?.content))
    contentForm.submitForm()
  }

  const deleteImage = useCallback(() => {
    setDeleteFileLinkPressed(true)
    imageForm.setFieldValue('image', null)
    imageForm.submitForm()
  }, [imageForm])

  const deleteFileOrLink = useCallback(() => {
    setDeleteFileLinkPressed(true)
    setSubStep('AddFileOrLink')
    contentForm.setFieldValue('content', null)
    contentForm.submitForm()
    setShouldShowErrors(false)
  }, [contentForm])

  const uploadImageRef = useRef<HTMLInputElement>(null)
  const selectImage = () => {
    uploadImageRef.current?.click()
  }

  const uploadFileRef = useRef<HTMLInputElement>(null)
  const selectFile = () => {
    uploadFileRef.current?.click()
  }

  const setContent = useCallback(
    (file: File | undefined) => {
      const isImage = file?.type.toLowerCase().startsWith('image')
      contentForm.setFieldValue('content', file).then(errors => {
        if (errors?.content) {
          setShouldShowErrors(!!errors?.content)
        } else if (isImage) {
          if (file) {
            contentForm.submitForm()
            imageForm.setFieldValue('image', file)
            imageForm.submitForm()
          }
        }
      })
    },
    [contentForm, imageForm],
  )

  const embed = contentUrl
    ? getPreviewFromUrl(contentUrl)
    : typeof contentForm.values.content === 'string'
    ? getPreviewFromUrl(contentForm.values.content)
    : null

  const dropHandler = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      setIsToDrop(false)
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault()

      let selectedFile

      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          const item = e.dataTransfer.items[i]
          if (item && item.kind === 'file') {
            const file = item.getAsFile()
            file && (selectedFile = file)
            break
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const item = e.dataTransfer.files[i]
          item && (selectedFile = item)
        }
      }
      if (subStep === 'AddFileOrLink') {
        setContent(selectedFile)
      } else {
        if (selectedFile) {
          imageForm.setFieldValue('image', selectedFile)
          imageForm.submitForm()
        }
      }
    },
    [imageForm, setContent, subStep],
  )

  const dragOverHandler = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsToDrop(true)

    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault()
  }, [])

  const uploadImage = (file: File) => {
    imageForm.setFieldValue('image', file)
    imageForm.submitForm()
  }

  const imageRef = useRef<HTMLDivElement>(null)

  const imageContainer = (
    <ImageContainer
      imageUrl={image}
      ref={imageRef}
      deleteImage={deleteImage}
      uploadImage={uploadImage}
      imageOnClick={imageOnClick}
      link={typeof contentForm.values.content === 'string' ? contentForm.values.content : undefined}
    />
  )

  const simpleImageContainer = <ImageContainer imageUrl={image} ref={imageRef} />

  const [imageHeight, setImageHeight] = useState<string | number>('initial')

  useEffect(() => {
    const currentImageHeight = imageRef.current?.clientHeight
    imageAvailable && contentAvailable && currentImageHeight && setImageHeight(currentImageHeight)
  }, [imageAvailable, contentAvailable, imageRef])

  const uploadedNameBackground =
    contentIsFile && uploadProgress
      ? `linear-gradient(to right, #1a6aff33 ${uploadProgress}% , #ffffff00 ${
          uploadProgress + 3
        }%, #ffffff00 )`
      : 'none'

  const fileUploader = (
    <div
      className="file upload"
      onClick={selectFile}
      onKeyUp={e => e.key === 'Enter' && selectFile()}
      tabIndex={0}
      // style={{ ...uploadHeight }}
    >
      <input
        ref={uploadFileRef}
        type="file"
        name="content"
        key="content"
        onChange={({ target }) => {
          setContent(target.files?.[0])
        }}
        hidden
      />
      <UploadFileIcon />
      <span>
        <span>Drop or click to upload a file!</span>
        <br />
        {fileMaxSize && (
          <span style={{ fontSize: '12px' }}>{/* Max size {prettyBytes(fileMaxSize)} */}</span>
        )}
      </span>
    </div>
  )

  const imageUploader = (
    <div
      className="image upload"
      onClick={selectImage}
      tabIndex={0}
      onKeyUp={e => e.key === 'Enter' && selectImage()}
      // style={{ ...uploadHeight }}
    >
      <input
        ref={uploadImageRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif"
        name="image"
        key="image"
        onChange={({ target }) => {
          const file = target.files?.[0]
          if (file) {
            uploadImage(file)
          }
        }}
        hidden
      />
      <UploadImageIcon />
      <span>Drop or click to upload an image!</span>
    </div>
  )

  const uploader = (type: 'file' | 'image') => {
    return (
      <div
        className={`uploader ${isToDrop ? 'hover' : ''} 
        `}
        //  ${contentForm.values.content instanceof Blob && form.errors.content ? 'error' : ''}
        id="drop_zone"
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
        onDragLeave={() => setIsToDrop(false)}
      >
        {type === 'file' ? fileUploader : imageUploader}
      </div>
    )
  }

  const uploaderDiv = (
    <>
      {!contentAvailable && uploader('file')}
      {!contentAvailable && imageAvailable && simpleImageContainer}
      {contentAvailable && (embed ?? (!imageAvailable && uploader('image')))}
      {contentAvailable && (embed ? undefined : imageAvailable && imageContainer)}
    </>
  )

  return (
    <div className="upload-resource">
      <div
        className={`main-container ${
          imageAvailable && !contentAvailable ? 'no-file-but-image' : ''
        }`}
        style={{
          height:
            imageAvailable && !contentAvailable
              ? imageHeight < 250 || imageHeight === 'initial'
                ? 250
                : imageHeight
              : 'fit-content',
        }}
      >
        {uploaderDiv}
      </div>
      <div className="bottom-container">
        {subStep === 'AddFileOrLink' ? (
          <InputTextField
            className="link"
            name="content"
            placeholder={`Paste or type a link`}
            ref={addLinkFieldRef}
            edit
            defaultValue={
              typeof contentForm.values.content === 'string' ? contentForm.values.content : ''
            }
            onChange={shouldShowErrors ? () => contentForm.validateField('content') : undefined}
            onKeyDown={e => e.key === 'Enter' && addLink()}
            action={<PrimaryButton onClick={addLink}>Add</PrimaryButton>}
            error={
              shouldShowErrors &&
              !(contentForm.values.content instanceof Blob) &&
              contentForm.errors.content
            }
          />
        ) : (
          <div
            className={`uploaded-name subcontainer ${contentIsFile ? 'file' : 'link'}`}
            style={{ background: uploadedNameBackground }}
          >
            <div className="content-icon">{contentIsFile ? <InsertDriveFile /> : <LinkIcon />}</div>
            <abbr className="scroll" title={contentName}>
              {contentName}
            </abbr>
            <RoundButton
              onClick={deleteFileOrLink}
              tabIndex={0}
              abbrTitle={contentIsFile ? 'Delete file' : 'Delete link'}
              onKeyUp={{ key: 'Enter', func: deleteFileOrLink }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
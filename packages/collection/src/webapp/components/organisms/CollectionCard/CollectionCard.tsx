import { Bookmark, BookmarkBorder, FilterNone, PermIdentity, Person } from '@material-ui/icons'
import { AddonItem, Card, isEllipsisActive, TertiaryButton } from '@moodlenet/component-library'
import { getBackupImage, Link } from '@moodlenet/react-app/ui'
import { Public } from '@mui/icons-material'
import { FC, useEffect, useRef, useState } from 'react'
import {
  CollectionCardAccess,
  CollectionCardActions,
  CollectionCardData,
  CollectionCardState,
} from '../../../../common.mjs'
import './CollectionCard.scss'

export type CollectionCardProps = {
  mainColumnItems?: AddonItem[]
  topLeftItems?: AddonItem[]
  topRightItems?: AddonItem[]

  data: CollectionCardData
  state: CollectionCardState
  actions: CollectionCardActions
  access: CollectionCardAccess
}

export const CollectionCard: FC<CollectionCardProps> = ({
  mainColumnItems,
  topLeftItems,
  topRightItems,

  data,
  state,
  actions,
  access,
}) => {
  const { collectionId, imageUrl, title, collectionHref } = data
  const { isPublished, bookmarked, followed, numFollowers, numResource } = state
  const { publish, setIsPublished, toggleFollow, toggleBookmark } = actions
  const { isAuthenticated, canEdit, isCreator } = access

  const background = {
    background:
      'radial-gradient(120% 132px at 50% 55%, rgba(0, 0, 0, 0.4) 0%,  rgba(0, 0, 0, 0.2) 73%) 0% 0% / cover, url(' +
      (imageUrl || getBackupImage(collectionId)) +
      ')',
    backgroundSize: 'cover',
  }

  const numResources = (
    <div className="num-resources" key="num-resources">
      <FilterNone />
      {numResource}
    </div>
  )

  const publishButton = canEdit && (
    <TertiaryButton
      key="publish-button"
      onClick={isPublished ? () => setIsPublished(false) : publish}
      className={`publish-button ${isPublished ? 'published' : 'draft'}`}
      abbr={isPublished ? 'Sent to draft' : 'Publish'}
    >
      <Public />
    </TertiaryButton>
  )

  const bookmarkButton = isAuthenticated && (
    <TertiaryButton
      key="bookmark-button"
      className={`bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
      onClick={toggleBookmark}
      abbr="Bookmark"
    >
      {bookmarked ? <Bookmark /> : <BookmarkBorder />}
    </TertiaryButton>
  )

  const followButton = (
    <TertiaryButton
      key="follow-button"
      className={`follow-button ${followed ? 'followed' : ''} ${
        !isAuthenticated || isCreator ? 'disabled' : ''
      }`}
      abbr={
        isCreator
          ? 'Creators cannot follow their own content'
          : !isAuthenticated
          ? 'Login to follow the resource'
          : 'Follow'
      }
      onClick={
        isAuthenticated && !isCreator
          ? toggleFollow
          : (e: React.MouseEvent<HTMLElement>) => e.stopPropagation()
      }
    >
      {followed ? <Person /> : <PermIdentity />}
      <span>{numFollowers}</span>
    </TertiaryButton>
  )

  const updatedTopLeftItems = [numResources, ...(topLeftItems ?? [])].filter(
    (item): item is AddonItem | JSX.Element => !!item,
  )

  const updatedTopRightItems = [
    bookmarkButton,
    followButton,
    publishButton,
    ...(topRightItems ?? []),
  ].filter((item): item is AddonItem | JSX.Element => !!item)

  const header = (
    <div className={`collection-card-header`} key="header">
      <div className="header-left">
        {updatedTopLeftItems.map(i => ('Item' in i ? <i.Item key={i.key} /> : i))}
      </div>
      <div className="header-right">
        {updatedTopRightItems.map(i => ('Item' in i ? <i.Item key={i.key} /> : i))}
      </div>
    </div>
  )

  const titleRef = useRef<HTMLElement>(null)
  const [showTitleAbbr, setShowTitleAbbr] = useState(false)
  useEffect(() => {
    titleRef.current instanceof HTMLElement && setShowTitleAbbr(isEllipsisActive(titleRef.current))
  }, [titleRef])

  const contentContainer = (
    <Link href={collectionHref} className="collection-card-content" key="content-containr">
      <abbr className="title" title={showTitleAbbr ? title : undefined} ref={titleRef}>
        {title}
      </abbr>
    </Link>
  )

  const updatedMainColumnItems = [header, contentContainer, ...(mainColumnItems ?? [])].filter(
    (item): item is AddonItem | JSX.Element => !!item,
  )

  return (
    <Card
      className={`collection-card ${isPublished ? 'published' : 'draft'}`}
      style={background}
      hover={true}
    >
      {updatedMainColumnItems.map(i => ('Item' in i ? <i.Item key={i.key} /> : i))}
    </Card>
  )
}

CollectionCard.displayName = 'CollectionCard'
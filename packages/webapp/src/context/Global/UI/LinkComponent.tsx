import { FC } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LinkComponentCtx, LinkComponentType } from '../../../ui/elements/link'

export const ProvideGlobalLinkComponent: FC = ({ children }) => {
  return <LinkComponentCtx.Provider value={LinkComp}>{children}</LinkComponentCtx.Provider>
}

const LinkComp: LinkComponentType = props => {
  const isExternal = props.href.ext
  const asExternal = props.asExt
  if (isExternal || asExternal) {
    const { href, externalClassName, externalStyle, activeClassName, activeStyle, ...restProps } = props
    return (
      <a
        {...restProps}
        href={href.url}
        className={externalClassName}
        style={externalStyle}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    )
  } else {
    const { href, externalClassName, externalStyle, ...restProps } = props
    const LinkComp = props.activeClassName || props.activeStyle ? NavLink : Link
    return (
      <LinkComp {...restProps} to={href.url} ref={null}>
        {props.children}
      </LinkComp>
    )
  }
}

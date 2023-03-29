import { ReactAppContext, ReactAppMainComponent, usePkgContext } from '@moodlenet/react-app/web-lib'
import { useContext } from 'react'

import { OpenIdPkgContext } from '../common/webapp/types.mjs'
import { ProvideOpenIdContext } from './OpenIdContextProvider.js'
import { routesItem } from './router.js'

const MainComponent: ReactAppMainComponent = ({ children }) => {
  const pkgContext = usePkgContext<OpenIdPkgContext>()
  const { registries } = useContext(ReactAppContext)
  registries.routes.useRegister(routesItem)
  return <ProvideOpenIdContext pkgContext={pkgContext}>{children}</ProvideOpenIdContext>
}
export default MainComponent
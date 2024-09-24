import type { PropsWithChildren } from 'react'
import { defaultStyle } from '../ui/lib/color-style'
import { GlobalProviders } from './root-layout.client'
import './root-layout.scss'

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <GlobalProviders>
          <section id="root">
            <div className={`layout-container`} id={`layout-container`} style={{ ...defaultStyle }}>
              {children}
            </div>
          </section>
        </GlobalProviders>
      </body>
    </html>
  )
}

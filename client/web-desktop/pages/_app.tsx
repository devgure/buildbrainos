import React from 'react'
import type { AppProps } from 'next/app'
import { initAuth } from '../src/services/adminApi'

export default function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // run initial silent refresh
    initAuth()
    // proactively refresh every 14 minutes to keep access token fresh
    const id = setInterval(() => {
      initAuth()
    }, 14 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return <Component {...pageProps} />
}

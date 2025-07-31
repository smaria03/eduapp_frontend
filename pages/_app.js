import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../lib/userAuth'

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    const isPublicPage = ['/login', '/register'].includes(router.pathname)

    if (!getToken() && !isPublicPage) {
      router.push('/login')
    }
  }, [router])

  return <Component {...pageProps} />
}

export default MyApp

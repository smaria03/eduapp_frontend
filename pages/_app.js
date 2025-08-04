import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../lib/userAuth'
import Layout from '../components/Layout'

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    const isPublicPage = ['/login', '/register'].includes(router.pathname)

    if (!getToken() && !isPublicPage) {
      router.push('/login')
    }
  }, [router])

  return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
  )
}

export default MyApp

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getUserId, getUsername, clearUserData } from '../lib/userAuth'
import { useRouter } from 'next/router'

const Layout = ({ children }) => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')

    useEffect(() => {
        setUsername(getUsername())
        setUserId(getUserId())
    }, [router])

    const isPublicPage = ['/login', '/register'].includes(router.pathname)
    if (isPublicPage) return <>{children}</>

    return (
        <>
            <header className="flex items-center justify-between bg-indigo-600 text-white px-6 py-3 shadow-md">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-2xl font-bold hover:underline"
                >
                    EduApp
                </button>
                <div className="flex items-center gap-4">
                    <Link href={`/profile/${userId}`} className="hover:underline">
                        {username}
                    </Link>
                    <Link
                        href="/logout"
                        className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 transition text-sm"
                    >
                        Logout
                    </Link>
                </div>
            </header>
            <main className="px-6 py-4">{children}</main>
        </>
    )
}

export default Layout

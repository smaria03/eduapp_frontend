import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getUserId, getUsername, getUserRole } from '../lib/userAuth'
import { useRouter } from 'next/router'

const Layout = ({ children }) => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState('')
    const [role, setRole] = useState('')

    useEffect(() => {
        setUsername(getUsername())
        setUserId(getUserId())
        setRole(getUserRole())
    }, [router])

    const isPublicPage = ['/login', '/register'].includes(router.pathname)
    if (isPublicPage) return <>{children}</>

    const tabClass = (path) =>
        `px-4 py-2 rounded-md transition ${
            router.pathname === path
                ? 'bg-indigo-700 text-white font-semibold shadow'
                : 'bg-transparent text-white hover:bg-indigo-500'
        }`

    return (
        <>
            <header className="flex items-center justify-between bg-indigo-600 text-white px-6 py-3 shadow-md">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-2xl font-bold hover:underline"
                >
                    EduApp
                </button>
                {role === 'admin' && (
                    <nav className="flex gap-8">
                        <Link href="/create-user" className={tabClass('/create-user')}>
                            Users
                        </Link>
                        <Link href="/classes" className={tabClass('/classes')}>
                            Classes
                        </Link>
                        <Link href="/subjects" className={tabClass('/subjects')}>
                            Subjects
                        </Link>
                        <Link href="/timetable" className={tabClass('/timetable')}>
                            Timetable
                        </Link>
                    </nav>
                )}
                {role === 'teacher' && (
                    <nav className="flex gap-8">
                        <Link href="/subjects" className={tabClass('/subjects')}>
                            Subjects
                        </Link>
                        <Link href="/schedule" className={tabClass('/schedule')}>
                            Schedule
                        </Link>
                        <Link href="/reports" className={tabClass('/reports')}>
                            Reports
                        </Link>
                    </nav>
                )}
                {role === 'student' && (
                    <nav className="flex gap-8">
                        <Link href="/subjects" className={tabClass('/subjects')}>
                            Subjects
                        </Link>
                        <Link href="/schedule" className={tabClass('/schedule')}>
                            Schedule
                        </Link>
                    </nav>
                )}
                <div className="flex items-center gap-3">
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

import Link from 'next/link'
import { getUserRole, getUsername } from '../lib/userAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const Dashboard = () => {
    const [role, setRole] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const userRole = getUserRole()
        if (!userRole) {
            router.push('/login')
        } else {
            setRole(userRole)
        }
    }, [router])

    if (!role) return null

    return (
        <div className="p-8 max-w-3xl mx-auto">
            {role === 'admin' && (
                <div className="space-y-4">
                    <p className="text-lg">Welcome, {getUsername()}! You have full access to administrative features!</p>
                </div>
            )}

            {role === 'teacher' && (
                <div className="space-y-4">
                    <p className="text-lg">Welcome, {getUsername()}! You have full access to teacher features!</p>
                </div>
            )}

            {role === 'student' && (
                <div className="space-y-4">
                    <p className="text-lg">Welcome, {getUsername()}! You have full access to student features!</p>
                </div>
            )}
        </div>
    )
}

export default Dashboard

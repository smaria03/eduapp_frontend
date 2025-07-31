import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { setUserData } from '../lib/userAuth'

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('student')

    const onSubmit = useCallback(
        async e => {
            e.preventDefault()
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, role }),
                })

                const data = await response.json()

                if (!response.ok || data.errors) {
                    alert(data.errors?.[0] || 'Login failed')
                    return
                }

                const user = data.user
                setUserData(user)
                await router.push('/dashboard')

            } catch (err) {
                alert('Something went wrong')
                console.error(err)
            }
        },
        [email, password, role, router]
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form className="space-y-5" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            id="role"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            required
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login

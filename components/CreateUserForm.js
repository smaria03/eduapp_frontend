import { useState } from 'react'
import { getToken } from '../lib/userAuth'
import { useRouter } from 'next/router'

const CreateUserForm = ({ onSuccess }) => {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [role, setRole] = useState('student')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const router = useRouter()

    const handleSubmit = async e => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    user: {
                        email,
                        password,
                        password_confirmation: passwordConfirmation,
                        name,
                        role,
                    }
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.errors?.join(', ') || 'Failed to create user')
                return
            }

            setSuccess('User created successfully!')
            router.push('/dashboard')
            setEmail('')
            setName('')
            setPassword('')
            setPasswordConfirmation('')
            setRole('student')
            if (onSuccess) onSuccess()
        } catch (err) {
            console.error(err)
            setError('Something went wrong')
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
            />
            <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
            />
            <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                required
            />
            <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Confirm Password"
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                type="password"
                required
            />
            <select
                className="w-full border rounded-md px-3 py-2"
                value={role}
                onChange={e => setRole(e.target.value)}
            >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
            </select>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
                Create User
            </button>
        </form>
    )
}

export default CreateUserForm

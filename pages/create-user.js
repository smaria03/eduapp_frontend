import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getUserRole } from '../lib/userAuth'
import CreateUserForm from '../components/CreateUserForm'

const CreateUserPage = () => {
    const router = useRouter()

    useEffect(() => {
        if (getUserRole() !== 'admin') {
            router.push('/unauthorized')
        }
    }, [router])

    return (
        <div className="max-w-lg mx-auto p-6 mt-10 bg-white border rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Create New User</h1>
            <CreateUserForm />
        </div>
    )
}

export default CreateUserPage

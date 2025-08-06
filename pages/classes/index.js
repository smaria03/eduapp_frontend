import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken, getUserRole } from '../../lib/userAuth'

const ClassesPage = () => {
    const [classes, setClasses] = useState([])
    const router = useRouter()

    useEffect(() => {
        const fetchClasses = async () => {
            const role = getUserRole()
            if (role !== 'admin') {
                router.push('/login')
                return
            }

            const res = await fetch('http://localhost:3000/api/admin/school_classes', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            const data = await res.json()
            setClasses(data.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })))
        }
        fetchClasses()
    }, [router])

    const handleDelete = async id => {
        const res = await fetch(`http://localhost:3000/api/admin/school_classes/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })

        if (res.ok) {
            setClasses(prev => prev.filter(cls => cls.id !== id))
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold mb-4">School Classes</h1>
            <Link
                href="/classes/new"
                className="inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
                Add New Class
            </Link>

            <ul className="space-y-2">
                {classes.map(cls => (
                    <li key={cls.id} className="flex items-center justify-between border p-3 rounded">
                        <Link href={`/classes/${cls.id}`} className="text-lg hover:underline">{cls.name}</Link>
                        <button
                            onClick={() => handleDelete(cls.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            X
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ClassesPage

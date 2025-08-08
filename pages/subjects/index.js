import { useEffect, useState } from 'react'
import { getToken, getUserRole } from '../../lib/userAuth'
import { useRouter } from 'next/router'

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([])
    const [newSubject, setNewSubject] = useState('')
    const router = useRouter()

    useEffect(() => {
        const role = getUserRole()
        if (role !== 'admin') {
            router.push('/login')
            return
        }

        const fetchSubjects = async () => {
            const res = await fetch('http://localhost:3000/api/subjects', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            const data = await res.json()
            setSubjects(data.sort((a, b) => a.name.localeCompare(b.name)))
        }

        fetchSubjects()
    }, [router])

    const handleAdd = async () => {
        if (!newSubject.trim()) return
        const res = await fetch('http://localhost:3000/api/subjects', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject: { name: newSubject.trim() } })
        })

        if (res.ok) {
            const created = await res.json()
            setSubjects(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
            setNewSubject('')
        }
    }

    const handleDelete = async id => {
        const res = await fetch(`http://localhost:3000/api/subjects/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })

        if (res.ok) {
            setSubjects(prev => prev.filter(subject => subject.id !== id))
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold mb-4">Subjects</h1>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Add new subject"
                    className="border px-3 py-2 rounded w-full" />
                <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    +
                </button>
            </div>

            <ul className="space-y-2">
                {subjects.map(subject => (
                    <li key={subject.id} className="flex items-center justify-between border p-3 rounded">
                        <span>{subject.name}</span>
                        <button
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600 hover:text-red-800">
                            X
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SubjectsPage

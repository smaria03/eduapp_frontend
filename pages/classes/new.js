import { useState } from 'react'
import { useRouter } from 'next/router'
import { getToken, getUserRole } from '../../lib/userAuth'
import { useEffect } from 'react'

const NewClassPage = () => {
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [students, setStudents] = useState([])
    const [selectedStudentIds, setSelectedStudentIds] = useState([])
    const router = useRouter()

    useEffect(() => {
        const role = getUserRole()
        if (role !== 'admin') {
            router.push('/login')
        }

        const fetchStudents = async () => {
            const res = await fetch('http://localhost:3000/api/students', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            const data = await res.json()
            const withoutClass = data.filter(s => s.school_class_id === null)
            setStudents(withoutClass)
        }

        fetchStudents()
    }, [router])

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        const res = await fetch('http://localhost:3000/api/school_classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                school_class: {
                    name,
                    student_ids: selectedStudentIds
                }
            })
        })

        if (res.ok) {
            router.push('/classes')
        } else {
            const data = await res.json()
            setError(data.message || 'Error creating class.')
        }
    }

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create a New Class</h1>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Class name"
                    className="w-full border px-4 py-2 rounded"
                    required
                />
                <div>
                    <p className="font-medium mb-2">Add students to this class:</p>
                    <div className="max-h-48 overflow-y-auto border p-2 rounded space-y-1">
                        {students.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No students available</p>
                        ) : (
                            students.map(student => (
                                <label key={student.id} className="block">
                                    <input
                                        type="checkbox"
                                        value={student.id}
                                        checked={selectedStudentIds.includes(student.id)}
                                        onChange={e => {
                                            const id = student.id
                                            setSelectedStudentIds(prev =>
                                                e.target.checked
                                                    ? [...prev, id]
                                                    : prev.filter(sid => sid !== id)
                                            )
                                        }}
                                        className="mr-2"
                                    />
                                    {student.name}
                                </label>
                            ))
                        )}
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
                >
                    Create Class
                </button>
            </form>
        </div>
    )
}

export default NewClassPage

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
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const STUDENTS_PER_PAGE = 5

    useEffect(() => {
        const role = getUserRole()
        if (role !== 'admin') {
            router.push('/login')
        }

        const fetchStudents = async () => {
            const res = await fetch('http://localhost:3000/api/students/without_class', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            const withoutClass = await res.json()
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

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE)

    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * STUDENTS_PER_PAGE,
        currentPage * STUDENTS_PER_PAGE
    )


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
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search student by name"
                        className="w-full border px-3 py-2 rounded mb-2"
                    />
                    <div className="max-h-48 overflow-y-auto border p-2 rounded space-y-1">
                        {paginatedStudents.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No students match your search</p>
                        ) : (
                            paginatedStudents.map(student => (
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
                    <div className="flex justify-between items-center mt-2 text-sm">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-2 py-1 border rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-2 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
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

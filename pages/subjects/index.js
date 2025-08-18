import { useEffect, useState } from 'react'
import { getToken, getUserRole, getUserId } from '../../lib/userAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([])
    const [newSubject, setNewSubject] = useState('')
    const [teacherSubjects, setTeacherSubjects] = useState([])
    const [role, setRole] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const userRole = getUserRole()
        setRole(userRole)

        if (!userRole) {
            router.push('/login')
            return
        }

        if (userRole === 'admin') {
            fetchAllSubjects()
        } else if (userRole === 'teacher') {
            fetchTeacherSubjects()
        }
    }, [router])

    const fetchAllSubjects = async () => {
        const res = await fetch('http://localhost:3000/api/subjects', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })
        const data = await res.json()
        setSubjects(data.sort((a, b) => a.name.localeCompare(b.name)))
    }

    const fetchTeacherSubjects = async () => {
        const teacherId = getUserId()
        const res = await fetch(`http://localhost:3000/api/subjects?teacher_id=${teacherId}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })
        const data = await res.json()
        setTeacherSubjects(data)
    }

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

            {role === 'admin' && (
                <>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                            placeholder="Add new subject"
                            className="border px-3 py-2 rounded w-full"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            +
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {subjects.map(subject => (
                            <li
                                key={subject.id}
                                className="flex items-center justify-between border p-3 rounded">
                                <span>{subject.name}</span>
                                <button
                                    onClick={() => handleDelete(subject.id)}
                                    className="text-red-600 hover:text-red-800">
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {role === 'teacher' && (
                <>
                    <p className="text-gray-700">You are assigned to the following subjects:</p>
                    <ul className="space-y-2">
                        {teacherSubjects.length === 0 ? (
                            <li className="italic text-gray-500">No subjects assigned yet.</li>
                        ) : (
                            teacherSubjects.map((item, idx) => (
                                <li key={idx} className="border p-3 rounded bg-gray-50">
                                    <Link
                                        href={{
                                            pathname: `/subjects/${item.assignment_id}`,
                                            query: {
                                                subject: item.subject_name,
                                                className: item.class_name,
                                                classId: item.class_id,
                                            }
                                        }}>
                                        {item.subject_name} – {item.class_name}
                                    </Link>

                                </li>
                            ))
                        )}
                    </ul>
                </>
            )}
        </div>
    )
}

export default SubjectsPage

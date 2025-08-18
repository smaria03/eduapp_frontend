import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const ClassSubjectPage = () => {
    const router = useRouter()
    const { subject, className, classId, assignmentId } = router.query
    const [students, setStudents] = useState([])

    useEffect(() => {
        if (!router.isReady || !classId) return

        const fetchStudents = async () => {
            try {
                const res = await fetch(`${API}/school_classes/${classId}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${getToken()}`
                    }
                })

                if (!res.ok) {
                    console.error(`Failed to fetch students: ${res.status}`)
                    return
                }

                const data = await res.json()
                setStudents(data.students || [])
            } catch (err) {
                console.error('Error fetching students:', err)
            }
        }

        fetchStudents()
    }, [router.isReady, classId])

    const handleStudentClick = (studentId) => {
        router.push(`/grades/${studentId}?assignmentId=${assignmentId}&subject=${subject}&classId=${classId}`)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{subject}</h1>
            <h2 className="text-xl text-gray-700 mb-4">Class: {className}</h2>

            <div className="space-y-2">
                {students.length === 0 ? (
                    <p className="italic text-gray-500">No students found.</p>
                ) : (
                    students.map(student => (
                        <div
                            key={student.id}
                            className="border rounded p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleStudentClick(student.id)}
                        >
                            {student.name}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ClassSubjectPage

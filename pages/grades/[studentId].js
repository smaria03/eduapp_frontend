import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const StudentGradesPage = () => {
    const router = useRouter()
    const { studentId, subject } = router.query
    const [studentName, setStudentName] = useState('')
    const [grades, setGrades] = useState([])
    const [subjectId, setSubjectId] = useState(null)
    const [newGrade, setNewGrade] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const fetchSubjectId = async (subjectName) => {
        try {
            const res = await fetch(`${API}/subjects`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            const subjects = await res.json()
            const subject = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase())
            return subject?.id
        } catch (err) {
            console.error('Error fetching subject ID:', err)
            return null
        }
    }

    const fetchStudentName = async () => {
        const res = await fetch(`${API}/users/${studentId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${getToken()}` }
        })

        if (res.ok) {
            const data = await res.json()
            setStudentName(data.name)
        }
    }

    const fetchGrades = async (resolvedSubjectId) => {
        try {
            const res = await fetch(
                `${API}/grades?student_id=${studentId}&subject_id=${resolvedSubjectId}`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${getToken()}` }
                }
            )

            if (res.ok) {
                const data = await res.json()
                setGrades(data)
            }
        } catch (err) {
            console.error('Error fetching grades:', err)
        }
    }

    useEffect(() => {
        if (!router.isReady || !studentId || !subject) return

        const initialize = async () => {
            await fetchStudentName()
            const resolvedId = await fetchSubjectId(subject)
            if (resolvedId) {
                setSubjectId(resolvedId)
                fetchGrades(resolvedId)
            }
        }

        initialize()
    }, [router.isReady, studentId, subject])

    const handleAddGrade = async (e) => {
        e.preventDefault()
        if (!subjectId) return

        try {
            const res = await fetch(`${API}/grades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    grade: {
                        student_id: studentId,
                        subject_id: subjectId,
                        value: parseInt(newGrade)
                    }
                })
            })

            if (res.ok) {
                setNewGrade('')
                setSuccessMsg('Grade added successfully!')
                setErrorMsg('')
                fetchGrades(subjectId)
            } else {
                const errData = await res.json()
                setErrorMsg(errData.errors?.join(', ') || 'Failed to add grade')
                setSuccessMsg('')
            }
        } catch (err) {
            setErrorMsg('Error adding grade')
            console.error(err)
        }
    }

    const handleDeleteGrade = async (gradeId) => {
        if (!confirm('Are you sure you want to delete this grade?')) return

        try {
            const res = await fetch(`${API}/grades/${gradeId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            })

            if (res.ok || res.status === 204) {
                fetchGrades(subjectId)
            } else {
                const err = await res.json()
                alert(err.error || 'Failed to delete grade')
            }
        } catch (err) {
            console.error('Error deleting grade:', err)
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">{subject} – Grades</h1>
            <h2 className="text-xl mb-6">Student: {studentName}</h2>

            <form onSubmit={handleAddGrade} className="space-y-4 bg-gray-50 p-4 rounded shadow">
                <h3 className="text-lg font-medium">Add new grade</h3>

                <div>
                    <label className="block mb-1">Grade value</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        className="border rounded px-3 py-1 w-full"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Grade
                </button>

                {successMsg && <p className="text-green-600">{successMsg}</p>}
                {errorMsg && <p className="text-red-600">{errorMsg}</p>}
            </form>

            {grades.length === 0 ? (
                <p className="text-gray-500 italic mb-6">No grades found.</p>
            ) : (
                <ul className="space-y-2 mb-6">
                    {grades.map((grade) => (
                        <li key={grade.id} className="border rounded p-3 bg-white shadow flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-lg">Grade: {grade.value}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Added on: {new Date(grade.created_at).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-sm"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default StudentGradesPage

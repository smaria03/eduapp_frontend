import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const HomeworkSubmissionsPage = () => {
    const router = useRouter()
    const { homeworkId, classId } = router.query
    const [students, setStudents] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (homeworkId && classId) {
            fetchStudents()
            fetchSubmissions()
        }
    }, [homeworkId, classId])

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API}/school_classes/${classId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setStudents(data.students || [])
        } catch (err) {
            console.error('Error fetching students:', err)
            setErrorMsg('Failed to load students.')
        }
    }

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`${API}/homework_submissions?homework_id=${homeworkId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setSubmissions(data || [])
        } catch (err) {
            console.error('Error fetching submissions:', err)
            setErrorMsg('Failed to load submissions.')
        }
    }

    const handleGrade = async (submissionId, gradeValue) => {
        try {
            const res = await fetch(`${API}/homework_submissions/${submissionId}/grade`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ grade: gradeValue })
            })

            if (res.ok) {
                setSuccessMsg('Grade submitted.')
                fetchSubmissions()
            } else {
                const data = await res.json()
                setErrorMsg(data.error || 'Failed to grade.')
            }
        } catch (err) {
            console.error('Error grading submission:', err)
            setErrorMsg('Failed to grade submission.')
        }
    }

    const getSubmissionForStudent = (studentId) =>
        submissions.find((s) => s.student_id === studentId)

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Homework Submissions</h1>
            {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}
            {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
            <div className="space-y-4">
                {students.map((student) => {
                    const submission = getSubmissionForStudent(student.id)
                    return (
                        <div key={student.id} className="p-4 border rounded bg-white shadow-sm">
                            <p className="font-semibold mb-1">{student.name}</p>
                            {submission ? (
                                <>
                                    <p>
                                        <a
                                            href={submission.uploaded_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline">
                                            View uploaded file
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Grade: {submission.grade ?? 'Not graded yet'}
                                    </p>
                                    {submission.grade == null && (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                const grade = e.target.elements.grade.value
                                                if (grade) handleGrade(submission.id, grade)
                                            }}
                                            className="mt-2 flex items-center gap-2">
                                            <input
                                                type="number"
                                                name="grade"
                                                min="1"
                                                max="10"
                                                placeholder="Enter grade"
                                                className="border px-2 py-1 rounded w-24"/>
                                            <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                                                Submit Grade
                                            </button>
                                        </form>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500 italic">Not submitted yet.</p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default HomeworkSubmissionsPage

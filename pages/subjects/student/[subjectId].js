import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getToken } from '../../../lib/userAuth'

const SubjectGradesPage = () => {
    const router = useRouter()
    const { subjectId, subject: subjectName } = router.query
    const [grades, setGrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!subjectId) return

        const fetchGrades = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/grades?subject_id=${subjectId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })

                if (!res.ok) throw new Error('Failed to fetch grades')

                const data = await res.json()
                setGrades(data)
            } catch (err) {
                console.error('Error fetching grades:', err)
                setError('Could not load your grades. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchGrades()
    }, [subjectId])

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                {subjectName ? `Your Grades for ${subjectName}` : 'Your Grades'}
            </h1>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : grades.length === 0 ? (
                <p className="italic text-gray-500">You have no grades yet for this subject.</p>
            ) : (
                <ul className="space-y-3">
                    {grades.map((grade) => (
                        <li key={grade.id} className="border p-3 rounded shadow">
                            <p><strong>Grade:</strong> {grade.value}</p>
                            <p className="text-sm text-gray-600">
                                <strong>Date:</strong> {new Date(grade.created_at).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default SubjectGradesPage

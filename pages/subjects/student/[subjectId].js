import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getToken } from '../../../lib/userAuth'

const SubjectGradesPage = () => {
    const router = useRouter()
    const { subjectId, subject: subjectName } = router.query
    const [grades, setGrades] = useState([])
    const [absences, setAbsences] = useState([])
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

        const fetchAbsences = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/attendances?status=absent&subject_id=${subjectId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })

                if (!res.ok) throw new Error('Failed to fetch absences')
                const data = await res.json()
                setAbsences(data)
            } catch (err) {
                console.error('Error fetching absences:', err)
                setError('Could not load your absences. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchGrades()
        fetchAbsences()
    }, [subjectId])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">
                    {subjectName ? `Your Records for ${subjectName}` : 'Your Subject Records'}
                </h1>
                <button
                    onClick={() =>
                        router.push({
                            pathname: '/quizzes',
                            query: {
                                subjectId: subjectId,
                                subject: subjectName
                            }
                        })
                    }
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    View Quizzes
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-3">Grades</h2>
                    {loading ? (
                        <p>Loading grades...</p>
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
                <div>
                    <h2 className="text-xl font-semibold mb-3">Absences</h2>
                    {loading? (
                        <p>Loading absences...</p>
                    ) : error ? (
                        <p className="text-red-600">{error}</p>
                    ) : absences.length === 0 ? (
                        <p className="italic text-gray-500">You have no absences for this subject.</p>
                    ) : (
                        <ul className="space-y-3">
                            {absences.map((absence) => (
                                <li key={absence.id} className="border p-3 rounded shadow">
                                    <p className="text-sm text-gray-700">
                                        <strong>Date:</strong> {new Date(absence.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <strong>Period:</strong> {absence.period_id}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SubjectGradesPage

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'
import QuizModal from '../../components/QuizModal'

const QuizzesPage = () => {
    const router = useRouter()
    const { subjectId, subject } = router.query
    const [quizzes, setQuizzes] = useState([])
    const [selectedQuiz, setSelectedQuiz] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const isDeadlinePassed = (quiz) => new Date(quiz.deadline) < new Date()

    useEffect(() => {
        if (!subjectId) return

        const fetchData = async () => {
            try {
                const [quizzesRes, submissionsRes] = await Promise.all([
                    fetch(`http://localhost:3000/api/quizzes?subject_id=${subjectId}`, {
                        headers: { Authorization: `Bearer ${getToken()}` }
                    }),
                    fetch(`http://localhost:3000/api/quizzes/submissions`, {
                        headers: { Authorization: `Bearer ${getToken()}` }
                    })
                ])

                if (!quizzesRes.ok || !submissionsRes.ok) throw new Error('Failed to fetch data')

                const [quizzesData, submissionsData] = await Promise.all([
                    quizzesRes.json(),
                    submissionsRes.json()
                ])

                setQuizzes(quizzesData)
                setSubmissions(submissionsData)
            } catch (err) {
                console.error(err)
                setError('Could not load quizzes.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [subjectId])

    const getSubmissionForQuiz = (quizId) =>
        submissions.find((s) => s.quiz.id === quizId)

    return (
        <div className="p-6 max-w-5xl mx-auto transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6">Available Quizzes for {subject}</h1>

            {loading ? (
                <p>Loading quizzes...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : quizzes.length === 0 ? (
                <p className="italic text-gray-500">No quizzes available yet.</p>
            ) : (
                quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded shadow p-4 mb-4">
                        <h2 className="text-lg font-semibold">{quiz.title}</h2>
                        <p className="text-gray-700">{quiz.description}</p>
                        <p><strong>Deadline:</strong> {new Date(quiz.deadline).toLocaleDateString()}</p>
                        <p><strong>Time Limit:</strong> {quiz.time_limit} min</p>

                        {getSubmissionForQuiz(quiz.id) ? (
                            <p className="mt-3 text-green-700 font-semibold">
                                Your Score: {getSubmissionForQuiz(quiz.id).final_score}/10
                            </p>
                        ) : isDeadlinePassed(quiz) ? (
                            <p className="mt-3 text-red-600 font-semibold italic">
                                Deadline passed. You can no longer attempt this quiz.
                            </p>
                        ) : (
                            <button
                                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                onClick={() => setSelectedQuiz(quiz)}>
                                Start Quiz
                            </button>
                        )}
                    </div>
                ))
            )}

            {selectedQuiz && (
                <QuizModal
                    quiz={selectedQuiz}
                    onClose={() => setSelectedQuiz(null)}
                    onSubmitted={async () => {
                        try {
                            const res = await fetch('http://localhost:3000/api/quizzes/submissions', {
                                method: 'GET',
                                headers: { Authorization: `Bearer ${getToken()}` }
                            })
                            const updated = await res.json()
                            setSubmissions(updated)
                        } catch (err) {
                            console.error('Failed to refresh submissions after quiz submit', err)
                        }
                    }}
                />
            )}
        </div>
    )
}

export default QuizzesPage

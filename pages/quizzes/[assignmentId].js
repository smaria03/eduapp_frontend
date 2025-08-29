import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const QuizzesPage = () => {
    const router = useRouter()
    const { assignmentId, subject, className } = router.query
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [timeLimit, setTimeLimit] = useState('')
    const [quizzes, setQuizzes] = useState([])
    const [questions, setQuestions] = useState([
        {
            question_text: '',
            point_value: '',
            options: [{ text: '', is_correct: false }]
        }
    ])
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (assignmentId) fetchQuizzes()
    }, [assignmentId])

    const fetchQuizzes = async () => {
        const res = await fetch(`${API}/quizzes?assignment_id=${assignmentId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        const data = await res.json()
        const sorted = data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        setQuizzes(sorted)
    }

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions]
        updated[index][field] = value
        setQuestions(updated)
    }

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const updated = [...questions]
        if (field === 'is_correct') {
            updated[qIndex].options[oIndex][field] = value.target.checked
        } else {
            updated[qIndex].options[oIndex][field] = value
        }
        setQuestions(updated)
    }

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question_text: '',
                point_value: '',
                options: [{ text: '', is_correct: false }]
            }
        ])
    }

    const removeQuestion = (qIndex) => {
        const updated = [...questions]
        updated.splice(qIndex, 1)
        setQuestions(updated)
    }

    const addOption = (qIndex) => {
        const updated = [...questions]
        updated[qIndex].options.push({ text: '', is_correct: false })
        setQuestions(updated)
    }

    const removeOption = (qIndex, oIndex) => {
        const updated = [...questions]
        if (updated[qIndex].options.length > 1) {
            updated[qIndex].options.splice(oIndex, 1)
            setQuestions(updated)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        for (const [index, question] of questions.entries()) {
            const hasCorrectOption = question.options.some(option => option.is_correct)
            if (!hasCorrectOption) {
                setErrorMsg(`Question ${index + 1} must have at least one correct answer.`)
                setSuccessMsg('')
                return
            }
        }

        const totalPoints = questions.reduce((sum, q) => sum + parseInt(q.point_value || 0), 0)
        if (totalPoints !== 9) {
            setErrorMsg(`Total points must be exactly 9 (you get 1 point automatically). Current total: ${totalPoints}`)
            setSuccessMsg('')
            return
        }

        const payload = {
            quiz: {
                title,
                description,
                deadline,
                time_limit: parseInt(timeLimit),
                assignment_id: parseInt(assignmentId),
                questions: questions.map(q => ({
                    question_text: q.question_text,
                    point_value: parseInt(q.point_value),
                    options: q.options.map(o => ({
                        text: o.text,
                        is_correct: o.is_correct
                    }))
                }))
            }
        }

        const res = await fetch(`${API}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            setSuccessMsg('Quiz created successfully!')
            setErrorMsg('')
            setTitle('')
            setDescription('')
            setDeadline('')
            setTimeLimit('')
            setQuestions([
                {
                    question_text: '',
                    point_value: '',
                    options: [{ text: '', is_correct: false }]
                }
            ])

            fetchQuizzes()
        } else {
            const err = await res.json()
            setErrorMsg(err.errors?.join(', ') || 'Failed to create quiz.')
            setSuccessMsg('')
        }
    }

    const handleDeleteQuiz = async (quizId) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return

        const res = await fetch(`${API}/quizzes/${quizId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` }
        })

        if (res.ok) {
            setSuccessMsg('Quiz deleted successfully!')
            setErrorMsg('')
            fetchQuizzes()
        } else {
            const err = await res.json()
            setErrorMsg(err.errors?.join(', ') || 'Failed to delete quiz.')
            setSuccessMsg('')
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Quizzes</h1>
            <h2 className="text-xl font-semibold mb-1">{subject}</h2>
            <h3 className="text-md text-gray-600 mb-6">Class: {className}</h3>

            <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-6 border">
                <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>

                <div className="mb-3">
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-medium">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-medium">Deadline</label>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-medium">Time Limit (minutes)</label>
                    <input
                        type="number"
                        min="1"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                <hr className="my-4" />

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="mb-6 border p-3 rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Question {qIndex + 1}</h3>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    X
                                </button>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="Question text"
                            value={q.question_text}
                            onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                            className="w-full border px-2 py-1 rounded mb-2"
                            required
                        />

                        <input
                            type="number"
                            placeholder="Points"
                            min="1"
                            value={q.point_value}
                            onChange={(e) => handleQuestionChange(qIndex, 'point_value', e.target.value)}
                            className="w-full border px-2 py-1 rounded mb-4"
                            required
                        />

                        {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder={`Option ${oIndex + 1}`}
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                    className="flex-1 border px-2 py-1 rounded"
                                    required
                                />
                                <label className="flex items-center gap-1 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={opt.is_correct}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e)}
                                    />
                                    Correct
                                </label>
                                {q.options.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(qIndex, oIndex)}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-sm hover:underline">
                            +Option
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addQuestion}
                    className="text-sm  hover:underline block mb-4">
                    +Question
                </button>

                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Create Quiz
                </button>

                {successMsg && <p className="text-green-600 mt-3">{successMsg}</p>}
                {errorMsg && <p className="text-red-600 mt-3">{errorMsg}</p>}
            </form>

            <div className="space-y-3">
                {quizzes.length === 0 ? (
                    <p className="text-gray-500 italic">No quizzes created yet.</p>
                ) : (
                    quizzes.map((quiz) => (
                        <div key={quiz.id} className="border rounded p-4 shadow-sm bg-white relative">
                            <button
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
                                title="Delete quiz">
                                X
                            </button>
                            <h3 className="font-semibold text-lg">{quiz.title}</h3>
                            <p className="text-sm text-gray-600">{quiz.description}</p>
                            <p className="text-sm mt-1 text-gray-500">
                                Deadline: {new Date(quiz.deadline).toLocaleString()} | Time: {quiz.time_limit} min
                            </p>
                            <p className="text-sm mt-1 text-gray-500">
                                Questions: {quiz.questions?.length || 0}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default QuizzesPage

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getToken } from '../lib/userAuth'

const API = 'http://localhost:3000/api'

const QuizModal = ({ quiz, onClose, onSubmitted }) => {
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60)
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(null)

    const submittingRef = useRef(false)

    useEffect(() => {
        if (submitted) return

        if (timeLeft <= 0) {
            ;(async () => {
                try {
                    await handleSubmit(true)
                } finally {
                    if (typeof onSubmitted === 'function') await onSubmitted()
                    onClose()
                }
            })()
            return
        }

        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
        return () => clearTimeout(t)
    }, [timeLeft, submitted])

    const handleSelect = (questionId, optionId) => {
        setAnswers((prev) => {
            const current = prev[questionId] || []
            const exists = current.includes(optionId)
            return {
                ...prev,
                [questionId]: exists ? current.filter((id) => id !== optionId) : [...current, optionId],
            }
        })
    }

    const handleSubmit = async (auto = false) => {
        if (submitted || submittingRef.current) return
        submittingRef.current = true
        setSubmitted(true)

        try {
            const payload = {
                answers: Object.entries(answers).map(([question_id, option_ids]) => ({
                    question_id: parseInt(question_id, 10),
                    selected_option_ids: (option_ids || []).map((id) => parseInt(id, 10)),
                })),
            }

            const res = await fetch(`${API}/quizzes/${quiz.id}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (res.ok) {
                setScore(data.final_score)
                if (!auto && typeof onSubmitted === 'function') {
                    await onSubmitted()
                }
            } else {
                console.error('Submit error:', data)
            }
        } catch (err) {
            console.error('Submission failed', err)
        } finally {
            submittingRef.current = false
        }
    }

    const handleClose = async () => {
        if (!submitted) {
            const confirmExit = window.confirm(
                'Are you sure you want to exit the quiz?\nYour answers so far will be submitted and you won\'t be able to return.'
            )
            if (!confirmExit) return
            await handleSubmit(true)
            if (typeof onSubmitted === 'function') await onSubmitted()
        }
        onClose()
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return createPortal(
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
                <button
                    className="absolute top-3 right-3 text-gray-600 hover:text-black"
                    onClick={handleClose}>
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>

                {!submitted && (
                    <p className="mb-2 text-gray-600">
                        Time left: <strong>{formatTime(timeLeft)}</strong>
                    </p>
                )}

                {quiz.questions.map((question) => (
                    <div key={question.id} className="mb-5">
                        <p className="font-semibold">{question.question_text}</p>
                        <div className="space-y-1 mt-2">
                            {question.options.map((opt) => (
                                <label key={opt.id} className="block">
                                    <input
                                        type="checkbox"
                                        name={`question-${question.id}`}
                                        value={opt.id}
                                        checked={answers[question.id]?.includes(opt.id) || false}
                                        onChange={() => handleSelect(question.id, opt.id)}
                                        disabled={submitted}
                                        className="mr-2"
                                    />
                                    {opt.text}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {!submitted ? (
                    <button
                        onClick={() => handleSubmit(false)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-4 disabled:opacity-60"
                        disabled={submitted}
                    >
                        Submit
                    </button>
                ) : score !== null ? (
                    <div className="mt-4">
                        <p className="text-green-700 font-semibold text-lg">Your score: {score}/10</p>
                    </div>
                ) : (
                    <p className="text-gray-500 italic mt-4">Score not available.</p>
                )}
            </div>
        </div>,
        document.body
    )
}

export default QuizModal

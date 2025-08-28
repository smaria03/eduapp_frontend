import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const HomeworksPage = () => {
    const router = useRouter()
    const { subjectId, subject } = router.query
    const [homeworks, setHomeworks] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [fileMap, setFileMap] = useState({})
    const fileInputs = useRef({})
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (subjectId) {
            fetchHomeworks()
            fetchSubmissions()
        }
    }, [subjectId])

    const fetchHomeworks = async () => {
        const res = await fetch(`${API}/homeworks?subject_id=${subjectId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })
        const data = await res.json()
        setHomeworks(data)
    }

    const fetchSubmissions = async () => {
        const res = await fetch(`${API}/homework_submissions?subject_id=${subjectId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })
        const data = await res.json()
        setSubmissions(data)
    }

    const getSubmissionForHomework = (homeworkId) =>
        submissions.find(s => s.homework_id === homeworkId)

    const handleFileChange = (homeworkId, file) => {
        setFileMap(prev => ({ ...prev, [homeworkId]: file }))
    }

    const handleUpload = async (homeworkId) => {
        if (!fileMap[homeworkId]) return

        setUploading(true)
        setMessage('')
        const formData = new FormData()
        formData.append('homework_id', homeworkId)
        formData.append('file', fileMap[homeworkId])

        try {
            const res = await fetch(`${API}/homework_submissions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
                body: formData
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Upload failed')
            }

            setMessage('Upload successful')
            await fetchSubmissions()
        } catch (err) {
            setMessage(err.message)
        } finally {
            setUploading(false)
        }
    }

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) < new Date()
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Homeworks for {subject}</h1>

            {message && <p className="mb-4 text-blue-600">{message}</p>}

            {homeworks.length === 0 ? (
                <p>No homeworks found for this subject.</p>
            ) : (
                <div className="space-y-6">
                    {homeworks.map(hw => {
                        const submission = getSubmissionForHomework(hw.id)
                        const alreadySubmitted = !!submission
                        const deadlinePassed = isDeadlinePassed(hw.deadline)

                        return (
                            <div key={hw.id} className="border p-4 rounded shadow">
                                <h2 className="text-xl font-semibold">{hw.title}</h2>
                                <p className="text-gray-700">{hw.description}</p>
                                <p className="text-sm text-gray-500">
                                    Deadline: {new Date(hw.deadline).toLocaleDateString()}
                                </p>

                                {submission && (
                                    <p className="text-gray-700">
                                        Grade: {submission.grade === null ? 'Not graded yet' : submission.grade}
                                    </p>
                                )}

                                {alreadySubmitted ? (
                                    <p className="mt-3 text-gray-700 font-semibold italic">
                                        Already submitted. You cannot upload again.
                                    </p>
                                ) : deadlinePassed ? (
                                    <p className="mt-3 text-red-600 font-semibold italic">
                                        Deadline passed. You can no longer submit this homework.
                                    </p>
                                ) : (
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3">
                                        <input
                                            type="file"
                                            ref={el => fileInputs.current[hw.id] = el}
                                            onChange={(e) => handleFileChange(hw.id, e.target.files[0])}
                                            className="w-full md:w-auto"
                                        />

                                        <button
                                            onClick={() => handleUpload(hw.id)}
                                            disabled={uploading}
                                            className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default HomeworksPage

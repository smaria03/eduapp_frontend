import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const HomeworksPage = () => {
    const router = useRouter()
    const { assignmentId, subject, className } = router.query
    const [homeworks, setHomeworks] = useState([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (assignmentId) fetchHomeworks()
    }, [assignmentId])

    const fetchHomeworks = async () => {
        try {
            const res = await fetch(`${API}/homeworks?assignment_id=${assignmentId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            const data = await res.json()
            setHomeworks(data)
        } catch (err) {
            console.error('Failed to fetch homeworks', err)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim() || !deadline) {
            setErrorMsg('Please provide a title, a description and a deadline.')
            setSuccessMsg('')
            return
        }

        const res = await fetch(`${API}/homeworks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                homework: {
                    title,
                    description,
                    deadline,
                    assignment_id: assignmentId
                }
            })
        })

        if (res.ok) {
            setTitle('')
            setDescription('')
            setDeadline('')
            setSuccessMsg('Homework created successfully.')
            setErrorMsg('')
            fetchHomeworks()
        } else {
            const errData = await res.json()
            setErrorMsg(errData.error || 'Failed to create homework.')
            setSuccessMsg('')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this homework?')) return

        const res = await fetch(`${API}/homeworks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` }
        })

        if (res.ok) {
            setSuccessMsg('Homework deleted successfully.')
            setErrorMsg('')
            fetchHomeworks()
        } else {
            setErrorMsg('Failed to delete homework.')
            setSuccessMsg('')
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Homeworks</h1>
            <h1 className="text-2xl font-bold mb-1">{subject}</h1>
            <h2 className="text-lg text-gray-600 mb-6">Class: {className}</h2>

            <form onSubmit={handleCreate} className="bg-white shadow p-4 rounded mb-6 border">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Create Homework
                </button>

                {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
                {errorMsg && <p className="text-red-600 mt-2">{errorMsg}</p>}
            </form>

            <div className="space-y-3">
                {homeworks.length === 0 ? (
                    <p className="text-gray-500 italic">No homeworks created yet.</p>
                ) : (
                    homeworks.map(hw => (
                        <div
                            key={hw.id}
                            className="p-3 border rounded shadow-sm bg-white hover:bg-gray-50 transition flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{hw.title}</p>
                                {hw.description && (
                                    <p className="text-sm text-gray-600">{hw.description}</p>
                                )}
                                <p className="text-sm text-gray-500">Deadline: {hw.deadline}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(hw.id)}
                                className="text-red-600 hover:underline text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default HomeworksPage

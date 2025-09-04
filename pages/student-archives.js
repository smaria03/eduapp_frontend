import { useEffect, useState } from 'react'
import {getToken, getUserRole} from '../lib/userAuth'
import {useRouter} from "next/router";

const API = 'http://localhost:3000/api'

const StudentArchivesPage = () => {
    const router = useRouter()
    const [archives, setArchives] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (getUserRole() !== 'student') {
            router.replace('/404')
            return
        }

        const fetchArchives = async () => {
            try {
                const res = await fetch(`${API}/student_archives`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })
                if (!res.ok) throw new Error('Failed to fetch archives')
                const data = await res.json()
                setArchives(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchArchives()
    }, [])

    if (loading) return <p className="p-4">Loading archives...</p>
    if (error) return <p className="p-4 text-red-500">{error}</p>

    const sortedLabels = Object.keys(archives).sort().reverse()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Student Archives</h1>

            {sortedLabels.map((label) => {
                const yearData = archives[label]
                return (
                    <div key={label} className="mb-6 border rounded-lg shadow p-4 bg-white">
                        <h2 className="text-xl font-semibold mb-1 text-indigo-700">
                            {label}
                        </h2>
                        <p className="text-sm text-gray-600 mb-3">
                            Class: <span className="font-medium">{yearData.class_name}</span>
                        </p>

                        {yearData.subjects.length === 0 ? (
                            <p className="text-gray-500 italic">No subjects available.</p>
                        ) : (
                            yearData.subjects.map((subject, idx) => (
                                <div
                                    key={idx}
                                    className="border-l-4 border-indigo-400 pl-3 mb-4 bg-indigo-50 rounded py-2"
                                >
                                    <p className="font-semibold text-indigo-900">
                                        {subject.subject_name}
                                    </p>
                                    <ul className="text-sm text-gray-800 list-disc list-inside">
                                        <li>
                                            Grades:{' '}
                                            {subject.grades.length > 0
                                                ? subject.grades.map((g) => g.value).join(', ')
                                                : 'None'}
                                        </li>
                                        <li>Attendances: {subject.present_count}</li>
                                        <li>Absences: {subject.absent_count}</li>
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default StudentArchivesPage

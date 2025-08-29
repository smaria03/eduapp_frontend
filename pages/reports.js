import { useEffect, useState } from 'react'
import { getToken, getUserId } from '../lib/userAuth'
import ClassReportModal from '../components/ClassReportModal'

const API = 'http://localhost:3000/api'

const ReportsPage = () => {
    const [classes, setClasses] = useState([])
    const [error, setError] = useState('')
    const [selectedReport, setSelectedReport] = useState(null)
    const [loadingReport, setLoadingReport] = useState(false)

    useEffect(() => {
        const fetchAssignedClasses = async () => {
            const teacherId = getUserId()
            try {
                const res = await fetch(`${API}/subjects?teacher_id=${teacherId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                const data = await res.json()

                const uniqueClasses = []
                const seen = new Set()

                data.forEach((assignment) => {
                    if (!seen.has(assignment.class_id)) {
                        seen.add(assignment.class_id)
                        uniqueClasses.push({
                            class_id: assignment.class_id,
                            class_name: assignment.class_name
                        })
                    }
                })

                setClasses(uniqueClasses)
            } catch (err) {
                setError(err.message)
            }
        }

        fetchAssignedClasses()
    }, [])

    const openReportModal = async (classId) => {
        setLoadingReport(true)
        try {
            const res = await fetch(`${API}/class_reports/${classId}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            const data = await res.json()
            setSelectedReport(data)
        } catch (err) {
            setError('Failed to load report.')
        } finally {
            setLoadingReport(false)
        }
    }

    const closeModal = () => setSelectedReport(null)

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Class Reports</h1>

            {error && <p className="text-red-600">{error}</p>}

            {!classes.length ? (
                <p className="italic text-gray-600">No classes with assignments found.</p>
            ) : (
                <ul className="space-y-4">
                    {classes.map((cls) => (
                        <li key={cls.class_id} className="border p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg">{cls.class_name}</p>
                            </div>
                            <button
                                onClick={() => openReportModal(cls.class_id)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                            >
                                View Report
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {loadingReport && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-40">
                <div className="bg-white p-4 rounded shadow">Loading report...</div>
                </div>
            )}

            <ClassReportModal report={selectedReport} onClose={closeModal} />
        </div>
    )
}

export default ReportsPage

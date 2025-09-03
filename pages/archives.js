import { useEffect, useState } from 'react'
import {getToken, getUserRole} from '../lib/userAuth'
import {useRouter} from "next/router";

const API = 'http://localhost:3000/api'

const ArchivesPage = () => {
    const router = useRouter()
    const [graduationLabel, setGraduationLabel] = useState('')
    const [graduationMessage, setGraduationMessage] = useState('')
    const [archiveLabels, setArchiveLabels] = useState([])
    const [selectedLabel, setSelectedLabel] = useState('')
    const [classesInLabel, setClassesInLabel] = useState([])
    const [selectedArchiveId, setSelectedArchiveId] = useState(null)
    const [archiveDetails, setArchiveDetails] = useState(null)

    useEffect(() => {
        if (getUserRole() !== 'admin') {
            router.replace('/404')
            return
        }

        const fetchLabels = async () => {
            try {
                const res = await fetch(`${API}/school_class_archives/labels`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                const data = await res.json()
                setArchiveLabels(data.labels.sort((a, b) => b.localeCompare(a)))
            } catch (err) {
                console.error('Failed to fetch labels', err)
            }
        }

        fetchLabels()
    }, [])

    useEffect(() => {
        if (!selectedLabel) return

        const fetchClasses = async () => {
            try {
                const res = await fetch(`${API}/school_class_archives/by_label/${selectedLabel}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                const data = await res.json()
                setClassesInLabel(data)
                setClassesInLabel(
                    data.sort((a, b) =>
                        a.school_class.archived_name.localeCompare(
                            b.school_class.archived_name,
                            undefined,
                            { numeric: true, sensitivity: 'base' }
                        )
                    )
                )
                setSelectedArchiveId(null)
                setArchiveDetails(null)
            } catch (err) {
                console.error('Failed to fetch classes for label', err)
            }
        }

        fetchClasses()
    }, [selectedLabel])

    useEffect(() => {
        if (!selectedArchiveId) return

        const fetchDetails = async () => {
            try {
                const res = await fetch(`${API}/school_class_archives/${selectedArchiveId}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                const data = await res.json()
                setArchiveDetails(data)
            } catch (err) {
                console.error('Failed to fetch archive details', err)
            }
        }

        fetchDetails()
    }, [selectedArchiveId])

    const handleGraduate = async () => {
        if (!graduationLabel) {
            alert('Please enter a label for the graduation year.')
            return
        }

        const confirmed = confirm(`Graduate all current classes with label "${graduationLabel}"?`)
        if (!confirmed) return

        try {
            const res = await fetch(`${API}/school_classes/graduation`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ label: graduationLabel })
            })

            const data = await res.json()
            setGraduationMessage(`${data.message} → ${data.graduated_classes.join(', ')}`)
        } catch (err) {
            setGraduationMessage('Graduation failed.')
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Graduation & Archives</h1>

            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-2">Graduate Current Classes</h2>
                <div className="flex gap-4 items-center mb-4">
                    <input
                        type="text"
                        placeholder="e.g. 2024-2025"
                        value={graduationLabel}
                        onChange={(e) => setGraduationLabel(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-64"
                    />
                    <button
                        onClick={handleGraduate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                        Graduate
                    </button>
                </div>
                {graduationMessage && <p className="text-green-600 font-medium">{graduationMessage}</p>}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">View Archived Classes</h2>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Select Promotion (Label):</label>
                    <select
                        value={selectedLabel}
                        onChange={(e) => setSelectedLabel(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded w-full">
                        <option value="">-- Choose promotion --</option>
                        {archiveLabels.map((label) => (
                            <option key={label} value={label}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {classesInLabel.length > 0 && (
                    <div className="mb-6">
                        <label className="block mb-1 font-medium">Select Archived Class:</label>
                        <select
                            value={selectedArchiveId || ''}
                            onChange={(e) => setSelectedArchiveId(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded w-full">
                            <option value="">-- Choose class --</option>
                            {classesInLabel.map((arch) => (
                                <option key={arch.id} value={arch.id}>
                                    {arch.school_class.archived_name} (current {arch.school_class.current_name})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {archiveDetails && archiveDetails.data && (
                    <div className="bg-gray-100 p-5 rounded shadow">
                        <h3 className="text-lg font-semibold mb-3">{archiveDetails.data.class_name}</h3>

                        <div className="mt-6 space-y-10">
                            {archiveDetails.data.assignments.map((assignment) => {
                                const subjectId = assignment.subject_id

                                return (
                                    <div key={subjectId} className="border-t pt-4">
                                        <h4 className="text-md font-bold mb-3">
                                            {assignment.subject_name} — <span className="font-normal">by {assignment.teacher_name}</span>
                                        </h4>

                                        <table className="w-full border-collapse text-sm shadow-sm">
                                            <thead>
                                            <tr className="bg-gray-200">
                                                <th className="text-left p-2 border">Student</th>
                                                <th className="text-left p-2 border">Grades</th>
                                                <th className="text-left p-2 border">Presences</th>
                                                <th className="text-left p-2 border">Absences</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {archiveDetails.data.students.map((student) => {
                                                const studentGrades = archiveDetails.data.grades.filter(
                                                    (g) => g.student_id === student.id && g.subject_id === subjectId
                                                )

                                                const studentAttendances = archiveDetails.data.attendances.filter(
                                                    (a) =>
                                                        a.user_id === student.id &&
                                                        a.assignment_id &&
                                                        archiveDetails.data.timetable_entries.some(
                                                            (entry) => entry.assignment_id === a.assignment_id && entry.subject_id === subjectId
                                                        )
                                                )

                                                const presences = studentAttendances.filter((a) => a.status === 'present').length
                                                const absences = studentAttendances.filter((a) => a.status === 'absent').length

                                                return (
                                                    <tr key={student.id} className="border-t">
                                                        <td className="p-2 border">{student.name}</td>
                                                        <td className="p-2 border">
                                                            {studentGrades.length > 0
                                                                ? studentGrades.map((g) => g.value).join(', ')
                                                                : '—'}
                                                        </td>
                                                        <td className="p-2 border">{presences}</td>
                                                        <td className="p-2 border">{absences}</td>
                                                    </tr>
                                                )
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ArchivesPage

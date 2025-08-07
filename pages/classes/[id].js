import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { getToken, getUserRole } from '../../lib/userAuth'

const ClassDetailsPage = () => {
    const router = useRouter()
    const { id } = router.query
    const [classData, setClassData] = useState(null)
    const [allStudents, setAllStudents] = useState([])
    const [error, setError] = useState('')
    const [editedName, setEditedName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [allSubjects, setAllSubjects] = useState([])
    const [assignedSubjects, setAssignedSubjects] = useState([])

    const fetchData = useCallback(async () => {
        const [classRes, studentsRes, subjectsRes, assignedRes] = await Promise.all([
            fetch(`http://localhost:3000/api/admin/school_classes/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
            fetch('http://localhost:3000/api/students', {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
            fetch('http://localhost:3000/api/admin/subjects', {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
            fetch(`http://localhost:3000/api/school_classes/${id}/subjects?school_class_id=${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
        ])

        const classJson = await classRes.json()
        const studentsJson = await studentsRes.json()
        const subjectsJson = await subjectsRes.json()
        const assignedJson = await assignedRes.json()

        setClassData(classJson)
        setAllStudents(studentsJson)
        setEditedName(classJson.name)
        setAllSubjects(subjectsJson)
        setAssignedSubjects(assignedJson)
    }, [id])

    const handleNameSave = async () => {
        setIsSaving(true)
        setSaveMessage('')

        const res = await fetch(`http://localhost:3000/api/admin/school_classes/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ school_class: { name: editedName } })
        })

        if (res.ok) {
            setSaveMessage('Name updated!')
            fetchData()
        } else {
            setSaveMessage('Error updating name')
        }
        setIsSaving(false)
    }

    useEffect(() => {
        const role = getUserRole()
        if (role !== 'admin') {
            router.push('/login')
            return
        }

        if (!id) return

        fetchData()
    }, [id, router, fetchData])

    const handleRemoveStudent = async studentId => {
        await fetch(`http://localhost:3000/api/admin/school_classes/${id}/remove_student/${studentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        fetchData()
    }

    const handleAddStudent = async studentId => {
        await fetch(`http://localhost:3000/api/admin/school_classes/${id}/add_student/${studentId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        fetchData()
    }

    const handleAssignSubject = async subjectId => {
        await fetch(`http://localhost:3000/api/school_classes/${id}/subjects/${subjectId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        fetchData()
    }

    const handleRemoveSubject = async subjectId => {
        await fetch(`http://localhost:3000/api/school_classes/${id}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        fetchData()
    }

    if (!classData) return <p className="p-8">Loading...</p>

    const studentsInClass = allStudents.filter(s => s.school_class_id === classData.id)
    const studentsWithoutClass = allStudents.filter(s => s.school_class_id === null)
    const availableSubjects = Array.isArray(allSubjects) && Array.isArray(assignedSubjects)
        ? allSubjects.filter(s => !assignedSubjects.find(a => a.id === s.id))
        : []

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Class: {classData.name}</h1>
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="text-2xl font-bold border p-1 rounded w-full max-w-xs"
                />
                <button
                    onClick={handleNameSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition disabled:opacity-50">
                    Save
                </button>
            </div>
            {saveMessage && <p className="text-sm text-green-600 mt-1">{saveMessage}</p>}

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Students in this class:</h2>
                        {studentsInClass.length === 0 ? (
                            <p className="text-gray-500 italic">No students assigned yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {studentsInClass.map(student => (
                                    <li key={student.id} className="flex justify-between items-center border p-2 rounded">
                                        <span>{student.name}</span>
                                        <button
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            X
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Students available to add:</h2>
                        {studentsWithoutClass.length === 0 ? (
                            <p className="text-gray-500 italic">No available students.</p>
                        ) : (
                            <ul className="space-y-2">
                                {studentsWithoutClass.map(student => (
                                    <li key={student.id} className="flex justify-between items-center border p-2 rounded">
                                        <span>{student.name}</span>
                                        <button
                                            onClick={() => handleAddStudent(student.id)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            +
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Subjects in this class:</h2>
                        {assignedSubjects.length === 0 ? (
                            <p className="text-gray-500 italic">No subjects assigned yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {assignedSubjects.map(subject => (
                                    <li key={subject.id} className="flex justify-between items-center border p-2 rounded">
                                        <span>{subject.name}</span>
                                        <button
                                            onClick={() => handleRemoveSubject(subject.id)}
                                            className="text-red-600 hover:text-red-800">
                                            X
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Available subjects to assign:</h2>
                        {availableSubjects.length === 0 ? (
                            <p className="text-gray-500 italic">No available subjects.</p>
                        ) : (
                            <ul className="space-y-2">
                                {availableSubjects.map(subject => (
                                    <li key={subject.id} className="flex justify-between items-center border p-2 rounded">
                                        <span>{subject.name}</span>
                                        <button
                                            onClick={() => handleAssignSubject(subject.id)}
                                            className="text-green-600 hover:text-green-800">
                                            +
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            {error && <p className="text-red-600">{error}</p>}
        </div>
    )
}

export default ClassDetailsPage

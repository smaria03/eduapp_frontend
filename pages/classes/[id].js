import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { getToken, getUserRole } from '../../lib/userAuth'

const ClassDetailsPage = () => {
    const router = useRouter()
    const { id } = router.query
    const PER_PAGE = 5
    const [classData, setClassData] = useState(null)
    const [allStudents, setAllStudents] = useState([])
    const [error, setError] = useState('')
    const [editedName, setEditedName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [allSubjects, setAllSubjects] = useState([])
    const [assignedSubjects, setAssignedSubjects] = useState([])
    const [teachers, setTeachers] = useState([])
    const [studentsInClass, setStudentsInClass] = useState([])
    const [studentsWithoutClass, setStudentsWithoutClass] = useState([])
    const [pageInClass, setPageInClass] = useState(1)
    const [pageNoClass, setPageNoClass] = useState(1)
    const [qInClass, setQInClass] = useState('')
    const [qNoClass, setQNoClass] = useState('')

    const fetchData = useCallback(async () => {
        const [classRes, subjectsRes, assignedRes, teachersRes] = await Promise.all([
            fetch(`http://localhost:3000/api/school_classes/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
            fetch('http://localhost:3000/api/subjects', {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
            fetch(`http://localhost:3000/api/school_classes/${id}/subjects?school_class_id=${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
            fetch('http://localhost:3000/api/teachers', {
                method: 'GET',
                headers: { Authorization: `Bearer ${getToken()}` }
            }),
        ])

        const classJson = await classRes.json()
        const subjectsJson = await subjectsRes.json()
        const assignedJson = await assignedRes.json()
        const teachersJson = await teachersRes.json()

        setClassData(classJson)
        setEditedName(classJson.name)
        setAllSubjects(subjectsJson)
        setAssignedSubjects(assignedJson)
        setTeachers(teachersJson)
    }, [id])

    const fetchStudentsInClass = useCallback(async () => {
        if (!id) return
        const url = `http://localhost:3000/api/students?school_class_id=${id}&page=${pageInClass}&per_page=${PER_PAGE}${qInClass ? `&q=${encodeURIComponent(qInClass)}` : ''}`
        const res = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${getToken()}` } })
        const json = await res.json()
        setStudentsInClass(json)
    }, [id, pageInClass, qInClass])

    const fetchStudentsNoClass = useCallback(async () => {
        const url = `http://localhost:3000/api/students?school_class_id=null&page=${pageNoClass}&per_page=${PER_PAGE}${qNoClass ? `&q=${encodeURIComponent(qNoClass)}` : ''}`
        const res = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${getToken()}` } })
        const json = await res.json()
        setStudentsWithoutClass(json)
    }, [pageNoClass, qNoClass])


    const handleNameSave = async () => {
        setIsSaving(true)
        setSaveMessage('')

        const res = await fetch(`http://localhost:3000/api/school_classes/${id}`, {
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
        fetchStudentsInClass()
        fetchStudentsNoClass()
    }, [id, router, fetchData, fetchStudentsInClass, fetchStudentsNoClass])

    const handleRemoveStudent = async studentId => {
        await fetch(`http://localhost:3000/api/school_classes/${id}/remove_student/${studentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        fetchData()
        if (studentsInClass.length === 1 && pageInClass > 1) setPageInClass(p => p - 1)
        fetchStudentsInClass()
        fetchStudentsNoClass()
    }

    const handleAddStudent = async studentId => {
        await fetch(`http://localhost:3000/api/school_classes/${id}/add_student/${studentId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        fetchData()
        if (studentsWithoutClass.length === 1 && pageNoClass > 1) setPageNoClass(p => p - 1)
        fetchStudentsInClass()
        fetchStudentsNoClass()
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

    const handleUpdateTeacher = async (assignmentId, teacherId) => {
        if (!assignmentId || !teacherId) return
        await fetch(`http://localhost:3000/api/school_class_subjects/${assignmentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ teacher_id: Number(teacherId) })
        })
        fetchData()
    }

    if (!classData) return <p className="p-8">Loading...</p>

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
                        <input value={qInClass} onChange={e=>{ setPageInClass(1); setQInClass(e.target.value) }} placeholder="Search..." className="border px-2 py-1 rounded mb-2" />
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
                        <div className="flex gap-2 mt-2">
                            <button disabled={pageInClass === 1} onClick={() => setPageInClass(p => p - 1)} className="px-2 py-1 border rounded">Prev</button>
                            <button disabled={studentsInClass.length < PER_PAGE} onClick={() => setPageInClass(p => p + 1)} className="px-2 py-1 border rounded">Next</button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Students available to add:</h2>
                        <input value={qNoClass} onChange={e=>{ setPageNoClass(1); setQNoClass(e.target.value) }} placeholder="Search..." className="border px-2 py-1 rounded mb-2" />
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
                        <div className="flex gap-2 mt-2">
                            <button disabled={pageNoClass === 1} onClick={() => setPageNoClass(p => p - 1)} className="px-2 py-1 border rounded">Prev</button>
                            <button disabled={studentsWithoutClass.length < PER_PAGE} onClick={() => setPageNoClass(p => p + 1)} className="px-2 py-1 border rounded">Next</button>
                        </div>
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
                                        <div className="flex items-center gap-2">
                                            <span>{subject.name}</span>
                                            {subject.teacher ? (
                                                <span className="text-sm text-gray-600">Teacher: {subject.teacher.name}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No teacher</span>
                                            )}
                                            <select
                                                className="border rounded px-2 py-1 ml-2"
                                                value={subject.teacher?.id ?? ''}
                                                onChange={e => handleUpdateTeacher(subject.assignment_id, e.target.value)}
                                            >
                                                <option value="">assign</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>

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

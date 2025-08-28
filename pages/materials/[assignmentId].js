import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken } from '../../lib/userAuth'
import { useRef } from 'react'

const API = 'http://localhost:3000/api'

const MaterialsPage = () => {
    const router = useRouter()
    const { assignmentId, subject, className } = router.query
    const [materials, setMaterials] = useState([])
    const [file, setFile] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const fileInputRef = useRef()

    useEffect(() => {
        if (assignmentId) fetchMaterials()
    }, [assignmentId])

    const fetchMaterials = async () => {
        const res = await fetch(`${API}/learning_materials?assignment_id=${assignmentId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${getToken()}` }
        })
        const data = await res.json()
        setMaterials(data)
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file || !title.trim()) {
            setErrorMsg('Please provide a title and a file.')
            setSuccessMsg('')
            return
        }

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip'
        ]

        if (!allowedTypes.includes(file.type)) {
            setErrorMsg('Invalid file type. Allowed: PDF, JPG, PNG, Word, Excel, ZIP')
            setSuccessMsg('')
            return
        }

        const formData = new FormData()
        formData.append('assignment_id', assignmentId)
        formData.append('file', file)
        formData.append('title', title)
        formData.append('description', desc)

        const res = await fetch(`${API}/learning_materials`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData
        })

        if (res.ok) {
            setSuccessMsg('Material uploaded successfully!')
            setErrorMsg('')
            setFile(null)
            fileInputRef.current.value = null
            setTitle('')
            setDesc('')
            fetchMaterials()
        } else {
            setErrorMsg('Upload failed.')
            setSuccessMsg('')
        }
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this material?')
        if (!confirmed) return

        const res = await fetch(`${API}/learning_materials/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        })

        if (res.ok) {
            setSuccessMsg('Material deleted successfully.')
            setErrorMsg('')
            fetchMaterials()
        } else {
            setErrorMsg('Failed to delete material.')
            setSuccessMsg('')
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Learning Materials</h1>
            <h1 className="text-2xl font-bold mb-1">{subject}</h1>
            <h2 className="text-lg text-gray-600 mb-6">Class: {className}</h2>
            <form onSubmit={handleUpload} className="bg-white shadow p-4 rounded mb-6 border">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div className="flex items-center mb-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.zip"
                        onChange={e => setFile(e.target.files[0])}
                        className="border border-gray-300 rounded px-2 py-1 mr-2"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Upload
                    </button>
                </div>

                {successMsg && <p className="text-green-600">{successMsg}</p>}
                {errorMsg && <p className="text-red-600">{errorMsg}</p>}
            </form>

            <div className="space-y-3">
                {materials.length === 0 ? (
                    <p className="text-gray-500 italic">No materials uploaded yet.</p>
                ) : (
                    <>
                        {[...materials].reverse().map((material) => (
                            <a
                                key={material.id}
                                href={material.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 border rounded shadow-sm bg-white hover:bg-gray-50 transition flex justify-between items-center">
                                <div className="flex flex-col">
                                    <p className="font-semibold">{material.title}</p>
                                    {material.description && (
                                        <p className="text-sm text-gray-600">{material.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleDelete(material.id)
                                    }}
                                    className="text-red-600 hover:underline text-sm ml-4">
                                    Delete
                                </button>
                            </a>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default MaterialsPage

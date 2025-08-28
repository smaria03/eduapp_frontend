import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getToken } from '../../lib/userAuth'

const MaterialsPage = () => {
    const router = useRouter()
    const { subjectId, subject: subjectName } = router.query
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!subjectId) return

        const fetchMaterials = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/learning_materials?subject_id=${subjectId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })

                if (!res.ok) throw new Error('Failed to fetch materials')
                const data = await res.json()
                setMaterials(data)
            } catch (err) {
                console.error('Error fetching materials:', err)
                setError('Could not load materials. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchMaterials()
    }, [subjectId])

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                {subjectName ? `Learning Materials for ${subjectName}` : 'Learning Materials'}
            </h1>

            {loading ? (
                <p>Loading materials...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : materials.length === 0 ? (
                <p className="italic text-gray-500">No materials uploaded yet for this subject.</p>
            ) : (
                <ul className="space-y-4">
                    {[...materials].reverse().map((material) => (
                        <li key={material.id} className="border rounded p-4 shadow">
                            <h2 className="text-lg font-semibold">{material.title}</h2>
                            {material.description && (
                                <p className="text-gray-700 mb-2">{material.description}</p>
                            )}
                            <p className="text-sm text-gray-600 mb-2">
                                Uploaded at: {new Date(material.uploaded_at).toLocaleDateString()}
                            </p>
                            {material.file_url ? (
                                <a
                                    href={material.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-indigo-600 hover:underline"
                                >
                                    Download file
                                </a>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No file attached</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default MaterialsPage

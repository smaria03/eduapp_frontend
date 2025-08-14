import { useRouter } from 'next/router'

const ClassSubjectPage = () => {
    const router = useRouter()
    const { subject, class: className } = router.query

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{subject}</h1>
            <h2 className="text-xl text-gray-700">Class: {className}</h2>
        </div>
    )
}

export default ClassSubjectPage

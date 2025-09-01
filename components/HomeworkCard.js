import { useRouter } from 'next/router'

const HomeworkCard = ({ hw, classId, onDelete }) => {
    const router = useRouter()

    return (
        <div
            onClick={() =>
                router.push({
                    pathname: `/homeworkSubmissions/${hw.id}`,
                    query: { classId }
                })
            }
            className="p-3 border rounded shadow-sm bg-white hover:bg-gray-50 transition flex justify-between items-center cursor-pointer">
            <div>
                <p className="font-semibold">{hw.title}</p>
                {hw.description && (
                    <p className="text-sm text-gray-600">{hw.description}</p>
                )}
                <p className="text-sm text-gray-500">Deadline: {hw.deadline}</p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(hw.id)
                }}
                className="text-red-600 hover:underline text-sm">
                Delete
            </button>
        </div>
    )
}

export default HomeworkCard

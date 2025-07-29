const DATA_KEY = `eduapp-data-${process.env.NEXT_PUBLIC_BASE_URL}`

const getUserField = field => {
    const data = localStorage.getItem(DATA_KEY)
    if (!data) return undefined
    const json = JSON.parse(data)
    return json[field]
}

export const getToken = () => getUserField('token')
export const getUsername = () => getUserField('name')
export const getUserId = () => getUserField('id')
export const getUserRole = () => getUserField('role')

export const setUserData = data => {
    const userData = {
        id: data.id,
        name: data.name,
        role: data.role,
        token: data.token,
    }
    localStorage.setItem(DATA_KEY, JSON.stringify(userData))
}

export const clearUserData = () => {
    localStorage.removeItem(DATA_KEY)
}

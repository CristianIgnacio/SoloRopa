import axios from "axios"

const getPublicProfile = async (username: string) => {
    const res = await axios.get(`/api/users/${username}`)
    return res.data
}

export default {getPublicProfile}

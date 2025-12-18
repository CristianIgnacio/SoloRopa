import axios from "axios"

const getPublicProfile = async (username: string) => {
    const res = await axios.get(`/api/users/${username}`)
    console.log(res)
    return res.data
}

export default {getPublicProfile}

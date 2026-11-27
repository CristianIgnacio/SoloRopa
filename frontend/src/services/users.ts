import axios from "axios"
import axiosSecure from "../utils/axiosSecure"

const getPublicProfile = async (username: string) => {
    const res = await axios.get(`/api/users/${username}`)
    return res.data
}

/** Activa o desactiva los avisos por correo de bajadas de precio (requiere sesión). */
const updatePriceDropNotifications = async (priceDrops: boolean): Promise<{ priceDrops?: boolean }> => {
    const res = await axiosSecure.patch("/api/users/me/notifications", { priceDrops })
    return res.data.notifications
}

/** Link "dejar de recibir avisos" de los correos: no requiere sesión, usa el token del link. */
const unsubscribePriceDrops = async (token: string) => {
    const res = await axios.post("/api/users/unsubscribe/price-drops", { token })
    return res.data
}

export default { getPublicProfile, updatePriceDropNotifications, unsubscribePriceDrops }

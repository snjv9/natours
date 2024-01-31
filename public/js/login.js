import axios from 'axios'
import { showAlert } from './alerts'
export const login = async (email, password) => {
    try {
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        console.log(result)
        if (result.data.status === 'success') {
            showAlert('success', 'Logged In Successfully')

            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)

    }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
        })
        console.log(res)
        if (res.data.status === 'success') {
            location.reload(true)
        }
    } catch (err) {
        showAlert('error', 'Error Logging Out Please Try Again')
    }
}


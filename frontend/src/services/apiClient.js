import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Gắn accessToken vào header Authorization
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Đăng ký callback khi refresh token để cập nhật cho các request song song
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor: Tự động refresh token khi nhận mã lỗi 401
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi 401 và không phải request đăng nhập/đăng xuất/refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${import.meta.env.API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = response.data?.data?.accessToken

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken)
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          processQueue(null, newAccessToken)
          isRefreshing = false
          
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        
        // Refresh token thất bại -> Xoá thông tin đăng nhập ở client
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        
        // Phát sự kiện logout để cập nhật giao diện
        window.dispatchEvent(new Event('auth:logout'))
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

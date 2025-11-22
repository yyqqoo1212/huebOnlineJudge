import http from '@/utils/request'

export const register = (payload) =>
  http.post('/users/register', {
    username: payload.username,
    password: payload.password,
    email: payload.email,
    gender: payload.gender || 'M',
    motto: payload.motto || '',
    avatar_url: payload.avatarUrl || '',
    student_id: payload.studentId || '',
    class_name: payload.className || '',
    real_name: payload.realName || ''
  })

export const login = (payload) =>
  http.post('/users/login', {
    username: payload.username,
    password: payload.password
  })

export const fetchProfile = () => http.get('/users/me')

export const updateProfile = (payload) =>
  http.patch('/users/me', {
    username: payload.username,
    email: payload.email,
    motto: payload.motto || '',
    gender: payload.gender || '',
    avatar_url: payload.avatarUrl || '',
    student_id: payload.studentId || '',
    class_name: payload.className || '',
    real_name: payload.realName || ''
  })

export const changePassword = (payload) =>
  http.post('/users/change-password', {
    old_password: payload.oldPassword,
    new_password: payload.newPassword
  })

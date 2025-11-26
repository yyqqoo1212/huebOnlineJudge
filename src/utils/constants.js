export const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL

export const STORAGE_KEYS = {
  TOKEN: 'hueb_token',
  TOKEN_TYPE: 'hueb_token_type',
  EXPIRES_AT: 'hueb_token_expires_at',
  USER: 'hueb_user'
}

export const API_ERROR_MESSAGES = {
  bad_json: '请求格式错误，请检查后重试。', // 400
  invalid_request: '请求参数不合法，请检查表单内容。',
  username_taken: '用户名已被使用，请尝试其他名称。',
  email_taken: '邮箱已被注册，请尝试找回密码或使用其他邮箱。',
  invalid_credentials: '用户名或密码错误。',
  db_error: '服务器暂时不可用，请稍后再试。'
}

export const DEFAULT_ERROR_MESSAGE = '服务器开小差了，请稍后再试。'

export const USERNAME_RULE = {
  min: 3,
  max: 50
}

export const PASSWORD_RULE = {
  min: 6
}

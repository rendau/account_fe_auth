export function sendCode (ctx, data) {
  return this.$api.post('profile/send_validating_code', data)
}

export function auth (ctx, data) {
  return this.$api.post('profile/auth', data)
}

export function authByToken (ctx, refresh_token) {
  return this.$api.post('profile/auth/token', { refresh_token })
}

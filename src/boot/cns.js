import { boot } from 'quasar/wrappers'

const cns = {
  ApiUrl: 'https://google.kz',

  LocaleRu: 'ru-ru',

  DefaultLocale: 'ru-ru',

  StorageTokenKey: 'auth.token',

  ErrSystem: 'system_error',
  ServiceNotAvailable: 'service_not_available',
  ErrNotAuthorized: 'not_authorized',
  PermissionDenied: 'permission_denied',
  ErrFormValidate: 'form_validate',
  ErrSmsSendLimitReached: 'sms_send_limit_reached',
  ErrSmsSendTooFrequent: 'sms_send_too_frequent',
  ErrWrongSmsCode: 'wrong_sms_code',

  ProfileLsKey: 'profile',
}

cns.ApiUrl = window.API_URL || cns.ApiUrl

if (process.env.API_URL) {
  cns.ApiUrl = process.env.API_URL
}

export default boot(async ({ app, store }) => {
  console.log('ApiUrl:', cns.ApiUrl)
  app.config.globalProperties.$cns = cns
  store.$cns = cns
})

export { cns }

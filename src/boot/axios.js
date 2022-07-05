import { boot } from 'quasar/wrappers'
import axios from 'axios'
import _ from 'lodash'
import { cns } from './cns'
import { ctx as i18nCtx } from './i18n'

const RTO = 30000

function transformErr (data) { // returns custom (for app) error
  const apiErrAttr = 'error_code'
  if (data && data[apiErrAttr]) {
    return _.assign(
      _.omit(data, [apiErrAttr]),
      { code: data[apiErrAttr] },
      { desc: i18nCtx.i18n.global.t(`api_err.${data[apiErrAttr]}`) || i18nCtx.i18n.global.t(cns.ErrSystem) },
    )
  }
  return {
    code: cns.ErrSystem,
    desc: i18nCtx.i18n.global.t(cns.ErrSystem),
  }
}

export default boot(({ app, store }) => {
  app.config.globalProperties.$axios = axios

  const api = axios.create({
    baseURL: cns.ApiUrl,
    responseType: 'json',
    timeout: RTO,
  })
  api.interceptors.response.use(
    resp => {
      return resp
    },
    err => {
      if (!err) {
        err = {}
      }
      if (err.response?.status === 401) {
        err.response.data = { error_code: cns.ErrNotAuthorized }
      }
      return Promise.reject({
        config: err.config,
        request: err.request,
        response: err.response,
        data: transformErr(err.response?.data),
      })
    },
  )
  app.config.globalProperties.$api = api
  store.$api = api
})

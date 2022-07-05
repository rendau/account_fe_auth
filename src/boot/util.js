import { boot } from 'quasar/wrappers'

let _store

let util = {
  fmtPhone (v) {
    if (!v) return ''
    return v.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
    // return v.replace(/(\d{3})(\d{3})(\d{4})/, '+7 $1 $2 $3')
  },
}

export default boot(async ({ app, store }) => {
  app.config.globalProperties.$u = util
  store.$u = util

  _store = store
})

export { util }

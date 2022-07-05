<template>
  <q-page class="fit q-pa-md">
    <div class="fit column no-wrap flex-center">
      <!-- success message -->
      <div v-if="showSuccess" class="text-center">
        <div class="text-h5 text-positive">
          Вы успешно авторизовались!
        </div>

        <div class="text-caption text-grey-8 q-pt-sm">
          скоро вы вернетесь на исходную систему
        </div>
      </div>

      <!-- already authed -->
      <div v-else-if="authedProfile" class="text-center">
        <template v-if="!loading">
          <div class="text-h6 text-green-8">
            Вы уже авторизованы!
          </div>

          <div class="q-pt-lg"/>

          <div class="text-body1">
            Хотите продолжить с номером <span class="text-bold">{{ $u.fmtPhone(authedProfile.phone) }}</span> ?
          </div>

          <div class="q-pt-lg q-pb-md"/>

          <div class="column no-wrap q-gutter-y-md">
            <div>
              <q-btn unelevated no-caps label="Да, продолжить" color="positive" @click="authByToken"/>
            </div>

            <div>
              <q-btn flat no-caps label="указать другой номер" color="red-4" @click="clearSavedProfile"/>
            </div>
          </div>
        </template>

        <div v-else class="text-center">
          <Spn/>
        </div>
      </div>

      <!-- form -->
      <template v-else>
        <!-- title -->
        <div class="text-h5 q-pb-xl">
          Авторизация
        </div>

        <!-- phone -->
        <div>
          <q-input outlined bg-color="c-ui-01"
                   type="tel"
                   label="Номер телефона"
                   v-model="phone"
                   mask=" (###) ### ####"
                   unmasked-value
                   prefix="+7"
                   :disable="loading"
                   :error="!!phoneErr"
                   :error-message="phoneErr"
                   :hide-bottom-space="!phoneErr"
                   style="min-width: 280px"/>
        </div>

        <template v-if="showSmsInput">
          <!-- sms-code -->
          <div class="q-pt-lg">
            <q-input outlined autofocus bg-color="c-ui-01"
                     type="password"
                     label="СМС код"
                     v-model="smsCode"
                     :disable="loading"
                     :error="!!smsCodeErr"
                     :error-message="smsCodeErr"
                     :hide-bottom-space="!smsCodeErr"
                     style="min-width: 280px"/>
          </div>

          <!-- resend btn -->
          <div class="q-pt-xs">
            <q-btn dense flat no-caps label="Отправить повторно код" color="blue-9"
                   :disable="loading" @click="sendSmsCode"/>
          </div>
        </template>

        <!-- submit btn -->
        <div class="q-pt-xl">
          <q-btn unelevated label="войти" color="primary" style="min-width: 130px"
                 :disable="loading" @click="onSubmit"/>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { cns } from 'boot/cns'
import { ls } from 'boot/ls'
import Spn from 'components/Spn'

const $q = useQuasar()
const store = useStore()

const loading = ref(false)
const phone = ref('')
const phoneErr = ref('')
const showSmsInput = ref(false)
const smsCode = ref('')
const smsCodeErr = ref('')
const showSuccess = ref(false)
const authedProfile = ref(getSavedProfile())

const fPhone = computed(() => (phone.value ? ('7' + phone.value) : ''))

function getSavedProfile () {
  let raw = ls.get(cns.ProfileLsKey)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch (e) {}
  }
  return null
}

function setSavedProfile (v) {
  ls.set(cns.ProfileLsKey, JSON.stringify(v))
}

const onSubmit = () => {
  if (!showSmsInput.value) {
    sendSmsCode().then(() => {
      showSmsInput.value = true
    }, () => {})
  } else {
    auth().catch(() => {})
  }
}

const sendSmsCode = async () => {
  phoneErr.value = ''
  smsCodeErr.value = ''

  if (!phone.value) {
    phoneErr.value = 'Введите номер'
    return Promise.reject()
  }

  loading.value = true
  return store.dispatch('auth/sendCode', {
    phone: fPhone.value,
    err_ne: true,
  }).then(() => {
    loading.value = false
  }, err => {
    loading.value = false
    if ([cns.ErrSmsSendLimitReached, cns.ErrSmsSendTooFrequent].indexOf(err.data.code) > -1) return
    $q.notify({ type: 'negative', message: err.data.desc })
    return Promise.reject()
  })
}

const auth = async () => {
  phoneErr.value = ''
  smsCodeErr.value = ''

  if (!phone.value) {
    phoneErr.value = 'Введите номер'
    return Promise.reject()
  }
  if (!smsCode.value) {
    smsCodeErr.value = 'Введите код'
    return Promise.reject()
  }

  loading.value = true
  return store.dispatch('auth/auth', {
    phone: fPhone.value,
    sms_code: parseInt(smsCode.value) || 0,
  }).then(resp => {
    loading.value = false
    setSavedProfile({
      phone: fPhone.value,
      refresh_token: resp.data.refresh_token,
    })
    showSuccess.value = true
    postMsg({
      phone: fPhone.value,
      access_token: resp.data.access_token,
      refresh_token: resp.data.refresh_token,
    })
  }, err => {
    loading.value = false
    if (err.data.code === cns.ErrWrongSmsCode) {
      smsCodeErr.value = err.data.desc
    }
    $q.notify({ type: 'negative', message: err.data.desc })
  })
}

const authByToken = async () => {
  let profile = authedProfile.value || {}
  loading.value = true
  store.dispatch('auth/authByToken', profile.refresh_token).then(resp => {
    showSuccess.value = true
    postMsg({
      phone: profile.phone,
      access_token: resp.data.access_token,
      refresh_token: profile.refresh_token,
    })
  }, err => {
    $q.notify({ type: 'negative', message: err.data.desc })
    clearSavedProfile()
  }).then(() => {
    loading.value = false
  })

  return true
}

const clearSavedProfile = () => {
  setSavedProfile(null)
  authedProfile.value = null
}

function postMsg (data) {
  window.opener && window.opener.postMessage(JSON.stringify(data), '*')
}
</script>

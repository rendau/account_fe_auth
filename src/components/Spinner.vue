<template>
  <q-inner-loading :showing="showing">
    <Spn color="primary" size="3em"/>
  </q-inner-loading>
</template>

<script setup>
import Spn from './Spn'

const props = defineProps({
  showing: { type: Boolean },
})
</script>

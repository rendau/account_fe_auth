<template>
  <q-layout view="lHh Lpr lFf" class="fit relative-position app-bg-color">
    <q-header class="bg-transparent">
      <div class="row flex-center" style="height: 80px">
        <q-img src="~assets/logo.svg" width="190px"/>
      </div>
    </q-header>
    <q-page-container class="fit">
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

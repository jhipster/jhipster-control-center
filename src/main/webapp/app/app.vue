<template>
  <div id="app">
    <ribbon></ribbon>
    <div id="app-header" class="py-5">
      <jhi-navbar></jhi-navbar>
    </div>
    <b-container fluid>
      <b-row>
        <jhi-sidebar></jhi-sidebar>
        <div class="card jh-card">
          <router-view></router-view>
        </div>
        <b-modal id="login-page" hide-footer lazy>
          <span slot="modal-title" id="login-title">Sign in</span>
          <login-form></login-form>
        </b-modal>
      </b-row>
      <b-row>
        <jhi-footer></jhi-footer>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts" src="./app.component.ts">
</script>

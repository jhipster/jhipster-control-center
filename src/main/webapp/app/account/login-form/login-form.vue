<template>
  <div class="modal-body">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <b-alert show data-cy="loginError" variant="danger" v-if="authenticationError">
          <strong>Failed to sign in!</strong> Please check your credentials and try again.
        </b-alert>
      </div>
      <div class="col-md-8">
        <b-form role="form" v-on:submit.prevent="doLogin()">
          <b-form-group label="Username" label-for="username">
            <b-form-input
              id="username"
              type="text"
              name="username"
              autofocus
              placeholder="Your username"
              v-model="login"
              data-cy="username"
            >
            </b-form-input>
          </b-form-group>
          <b-form-group label="Password" label-for="password">
            <b-form-input
              id="password"
              type="password"
              name="password"
              v-model.trim="name"
              placeholder="Your password"
              v-model="password"
              data-cy="password"
            >
            </b-form-input>
          </b-form-group>
          <b-form-checkbox id="rememberMe" name="rememberMe" v-model="rememberMe" checked>
            <span>Remember me</span>
          </b-form-checkbox>
          <div>
            <b-button data-cy="submit" type="submit" variant="primary">Sign in</b-button>
          </div>
        </b-form>
        <p></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./login-form.component.ts"></script>

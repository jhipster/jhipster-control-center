<template>
  <b-navbar toggleable="md" type="dark" class="bg-primary">
    <b-row>
      <div class="jh-logo-container" my-auto>
        <div class="icon-sidebar" id="sidebar-icon" exact v-if="hasAnyAuthority('ROLE_ADMIN')">
          <div v-b-toggle.sidebar-footer>
            <b-button variant="outline-primary">
              <font-awesome-icon class="fa-lg" icon="ellipsis-v" />
              <font-awesome-icon class="fa-lg" icon="ellipsis-v" />
            </b-button>
          </div>
        </div>
        <b-navbar-brand class="logo" b-link to="/">
          <span class="logo-img"></span>
          <span class="navbar-title"><span class="jhipster-title">JHipster</span> Control Center</span>
          <span class="navbar-version">{{ version }}</span>
        </b-navbar-brand>
        <b-navbar-toggle
          class="header-tabs"
          right
          href="javascript:void(0);"
          target="header-tabs"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <font-awesome-icon icon="bars" />
        </b-navbar-toggle>
      </div>
    </b-row>
    <b-collapse is-nav id="header-tabs">
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/" exact>
          <span>
            <font-awesome-icon icon="home" />
            <span>Home</span>
          </span>
        </b-nav-item>
        <b-nav-item-dropdown right id="entity-menu" v-if="authenticated" active-class="active" class="pointer">
          <span slot="button-content" class="navbar-dropdown-menu">
            <font-awesome-icon icon="th-list" />
            <span>Entities</span>
          </span>
          <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
        </b-nav-item-dropdown>
        <b-nav-item-dropdown
          right
          id="applications-menu"
          v-if="hasAnyAuthority('ROLE_ADMIN')"
          :class="{ 'router-link-active': subIsActive('/applications') }"
          active-class="active"
          class="pointer"
        >
          <span slot="button-content" class="navbar-dropdown-menu">
            <font-awesome-icon icon="cogs" />
            <span>Administration</span>
          </span>
          <b-dropdown-item none disabled>
            <font-awesome-icon icon="chart-line" />
            <span>DashBoard</span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/jhi-metrics">
            <font-awesome-icon icon="tachometer-alt" />
            <span id="collapse-1">Metrics</span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/jhi-health">
            <font-awesome-icon icon="heart" />
            <span>Health</span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/jhi-configuration">
            <font-awesome-icon icon="list" />
            <span>Configuration</span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/logs">
            <font-awesome-icon icon="tasks" />
            <span>Logs</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="swaggerEnabled" to="/admin/docs">
            <font-awesome-icon icon="book" />
            <span>API</span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown
          right
          href="javascript:void(0);"
          id="account-menu"
          :class="{ 'router-link-active': subIsActive('/account') }"
          active-class="active"
          class="pointer"
        >
          <span slot="button-content" class="navbar-dropdown-menu">
            <font-awesome-icon icon="user" />
            <span>
              Account
            </span>
          </span>
          <b-dropdown-item v-if="authenticated" v-on:click="logout()" id="logout">
            <font-awesome-icon icon="sign-out-alt" />
            <span>Sign out</span>
          </b-dropdown-item>
          <b-dropdown-item v-if="!authenticated" v-on:click="openLogin()" id="login">
            <font-awesome-icon icon="sign-in-alt" />
            <span>Sign in</span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts" src="./jhi-navbar.component.ts"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* ==========================================================================
Navbar
========================================================================== */

/* jhcc-custom */
.navbar {
  min-height: 4rem;
  padding: 0.5rem !important;
  z-index: 1000;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  justify-content: start;
}

.navbar-dropdown-menu {
  right: 0;
}

/* ==========================================================================
    Title
    ========================================================================== */

.navbar-title {
  display: inline-block;
  vertical-align: middle;
  font-family: Pacifico, cursive;
  font-weight: lighter;
}

.jhipster-title {
  font-size: larger;
}

.navbar-version {
  font-size: 10px;
  vertical-align: sub;
}

/* ==========================================================================
    @media screen
    ========================================================================== */

@media screen and (min-width: 768px) {
  navbar-toggle {
    display: none;
  }
}

@media screen and (min-width: 768px) and (max-width: 1150px) {
  span span {
    display: none;
  }
}
@media screen and (max-width: 768px) {
  .jh-logo-container {
    width: 100%;
  }
}

/* ==========================================================================
    button & icon
    ========================================================================== */

.navbar-dark button {
  color: white;
}

.header-tabs {
  position: absolute;
  right: 1rem;
  line-height: 1.5;
  margin-top: 10px;
}

.icon-sidebar {
  display: inline-block;
  margin-left: 10px;
}

/* ==========================================================================
    Logo styles
    ========================================================================== */
.navbar-brand.logo {
  padding: 5px 15px;
}

.logo .logo-img {
  height: 45px;
  display: inline-block;
  vertical-align: middle;
  width: 70px;
}

.logo-img {
  height: 100%;
  background: url('../../../content/images/logo-jhipster.png') no-repeat center center;
  background-size: contain;
  width: 100%;
  filter: drop-shadow(0 0 0.05rem white);
}
</style>

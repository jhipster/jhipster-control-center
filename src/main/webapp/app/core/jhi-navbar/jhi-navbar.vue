<template>
    <b-navbar toggleable="md" type="dark" class="jh-navbar">
        <div class="jh-logo-container float-left">
            <b-navbar-toggle right class="jh-navbar-toggler d-lg-none float-right" href="javascript:void(0);"  data-toggle="collapse" target="header-tabs" aria-expanded="false" aria-label="Toggle navigation">
                <font-awesome-icon icon="bars" />
            </b-navbar-toggle>
            <b-navbar-brand class="logo float-left" b-link to="/">
                <span class="logo-img"></span>
                <span class="navbar-title">jhipsterControlCenter</span> <span class="navbar-version">{{version}}</span>
            </b-navbar-brand>
        </div>
        <b-collapse is-nav id="header-tabs">
            <b-navbar-nav class="ml-auto">
                <b-nav-item to="/" exact>
                    <span>
                        <font-awesome-icon icon="home" />
                        <span>Home</span>
                    </span>
                </b-nav-item>
                <b-nav-item-dropdown
                    id="entity-menu"
                    v-if="authenticated"
                    active-class="active" class="pointer">
                    <span slot="button-content" class="navbar-dropdown-menu">
                        <font-awesome-icon icon="th-list" />
                        <span>Entities</span>
                    </span>
                    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
                </b-nav-item-dropdown>
                <b-nav-item-dropdown
                    id="admin-menu"
                    v-if="hasAnyAuthority('ROLE_ADMIN')"
                    :class="{'router-link-active': subIsActive('/admin')}"
                    active-class="active"
                    class="pointer">
                    <span slot="button-content" class="navbar-dropdown-menu">
                        <font-awesome-icon icon="user-plus" />
                        <span>Administration</span>
                    </span>
                    <b-dropdown-item  to="/admin/jhi-metrics">
                        <font-awesome-icon icon="tachometer-alt" />
                        <span>Metrics</span>
                    </b-dropdown-item>
                    <b-dropdown-item to="/admin/jhi-health">
                        <font-awesome-icon icon="heart" />
                        <span>Health</span>
                    </b-dropdown-item>
                    <b-dropdown-item  to="/admin/jhi-configuration">
                        <font-awesome-icon icon="list" />
                        <span>Configuration</span>
                    </b-dropdown-item>
                    <b-dropdown-item  to="/admin/logs">
                        <font-awesome-icon icon="tasks" />
                        <span>Logs</span>
                    </b-dropdown-item>
                    <b-dropdown-item v-if="swaggerEnabled"  to="/admin/docs">
                        <font-awesome-icon icon="book" />
                        <span>API</span>
                    </b-dropdown-item>
                </b-nav-item-dropdown>
                <b-nav-item-dropdown
                    right
                    href="javascript:void(0);"
                    id="account-menu"
                    :class="{'router-link-active': subIsActive('/account')}"
                    active-class="active"
                    class="pointer">
                    <span slot="button-content" class="navbar-dropdown-menu">
                        <font-awesome-icon icon="user" />
                        <span>
                            Account
                        </span>
                    </span>
                    <b-dropdown-item v-if="authenticated"  v-on:click="logout()" id="logout">
                        <font-awesome-icon icon="sign-out-alt" />
                        <span>Sign out</span>
                    </b-dropdown-item>
                    <b-dropdown-item v-if="!authenticated"  v-on:click="openLogin()" id="login">
                        <font-awesome-icon icon="sign-in-alt" />
                        <span>Sign in</span>
                    </b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script lang="ts" src="./jhi-navbar.component.ts">
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* ==========================================================================
    Navbar
    ========================================================================== */
.navbar-version {
  font-size: 10px;
  color: #ccc;
}

.jh-navbar {
  background-color: #353d47;
  padding: 0.2em 1em;
}

.jh-navbar .profile-image {
  margin: -10px 0px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

.jh-navbar .dropdown-item.active,
.jh-navbar .dropdown-item.active:focus,
.jh-navbar .dropdown-item.active:hover {
  background-color: #353d47;
}

.jh-navbar .dropdown-toggle::after {
  margin-left: 0.15em;
}

.jh-navbar ul.navbar-nav {
  padding: 0.5em;
}

.jh-navbar .navbar-nav .nav-item {
  margin-left: 1.5rem;
}

.jh-navbar a.nav-link {
  font-weight: 400;
}

.jh-navbar .jh-navbar-toggler {
  color: #ccc;
  font-size: 1.5em;
  padding: 10px;
}

.jh-navbar .jh-navbar-toggler:hover {
  color: #fff;
}

@media screen and (min-width: 768px) {
  .jh-navbar-toggler {
    display: none;
  }
}

@media screen and (min-width: 768px) and (max-width: 1150px) {
  span span{
    display:none;
  }
}

@media screen and (max-width: 767px) {
  .jh-logo-container {
    width: 100%;
  }
}

.navbar-title {
  display: inline-block;
  vertical-align: middle;
  color: white;
}
/* waiting for bootstrap fix bug on nav-item-dropdown a:active
https://github.com/bootstrap-vue/bootstrap-vue/issues/2219
*/
nav li.router-link-active .navbar-dropdown-menu {
  cursor: pointer;
  color: #fff;
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
  background: url("../../../content/images/logo-jhipster.png") no-repeat center
    center;
  background-size: contain;
  width: 100%;
}
</style>

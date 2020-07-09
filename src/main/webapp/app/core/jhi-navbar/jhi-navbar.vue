<template>
    <b-navbar toggleable="md" type="dark" class="bg-dark">
        <b-navbar-brand class="logo" b-link to="/">
            <span class="logo-img"></span>
            <span class="navbar-title">jhipsterControlCenter</span> <span class="navbar-version">{{version}}</span>
        </b-navbar-brand>      
        <b-navbar-toggle 
        right 
        class="jh-navbar-toggler d-lg-none" 
        href="javascript:void(0);"  
        data-toggle="collapse" 
        target="header-tabs" 
        aria-expanded="false" 
        aria-label="Toggle navigation">
            <font-awesome-icon icon="bars" />
        </b-navbar-toggle>
           
        <b-collapse is-nav id="header-tabs">
            <b-navbar-nav class="ml-auto">
                <b-nav-item to="/" exact>
                    <span>
                        <font-awesome-icon icon="home" />
                        <span>Home</span>
                    </span>
                </b-nav-item>
                <b-nav-item-dropdown
                    right
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
                    right
                    id="admin-menu"
                    v-if="hasAnyAuthority('ROLE_ADMIN') && authenticated"
                    :class="{'router-link-active': subIsActive('/admin')}"
                    active-class="active"
                    class="pointer">
                    <span slot="button-content" class="navbar-dropdown-menu">
                        <font-awesome-icon icon="cogs" />
                        <span>Administration</span>
                    </span>
                    <b-dropdown-item  to="/admin/jhi-metrics" active-class="active">
                        <font-awesome-icon icon="tachometer-alt" />
                        <span>Metrics</span>
                    </b-dropdown-item>
                    <b-dropdown-item to="/admin/jhi-health" active-class="active">
                        <font-awesome-icon icon="heart" />
                        <span>Health</span>
                    </b-dropdown-item>
                    <b-dropdown-item  to="/admin/jhi-configuration" active-class="active">
                        <font-awesome-icon icon="list" />
                        <span>Configuration</span>
                    </b-dropdown-item>
                    <b-dropdown-item  to="/admin/logs" active-class="active">
                        <font-awesome-icon icon="tasks" />
                        <span>Logs</span>
                    </b-dropdown-item>
                    <b-dropdown-item v-if="swaggerEnabled"  to="/admin/docs" active-class="active">
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
                    <b-dropdown-item v-if="authenticated"  v-on:click="logout()" id="logout" active-class="active">
                        <font-awesome-icon icon="sign-out-alt" />
                        <span>Sign out</span>
                    </b-dropdown-item>
                    <b-dropdown-item v-if="!authenticated"  v-on:click="openLogin()" id="login" active-class="active">
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

.navbar-title {
  display: inline-block;
  vertical-align: middle;
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
  filter: drop-shadow(0 0 0.05rem white);
}
</style>

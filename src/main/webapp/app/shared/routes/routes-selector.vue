<template>
    <b-row align-h="end">
        <b-dropdown ref="dd" variant="outline-primary" v-on:click="$event.stopPropagation()" right>
            <span slot="button-content">{{ htmlActiveRoute }} &nbsp;</span>
            <p class="d-flex">
                <b-form-input type="search" class="form-control d-flex search" placeholder="Search an application..."
                              v-model="searchedInstance" v-on:change="searchByAppName()"  v-on:click.stop/>
            </p>
            <div v-for="route in routes" :key="route.path">
                <button class="dropdown-item" v-on:click="[setActiveRoute(route),htmlActiveRoute = getActiveRoute(),$refs.dd.hide()]">
                    <span>{{ route.serviceId.toUpperCase() }} {{ route.path ? '(' + route.path + ')' : '' }}</span>
                </button>
            </div>
        </b-dropdown>

        <refresh-selector class="ml-2"></refresh-selector>

        <p v-if="updatingRoutes && (!routes || routes.length === 0)">Loading...</p>
    </b-row>
</template>

<script lang="ts" src="./routes-selector.component.ts"></script>

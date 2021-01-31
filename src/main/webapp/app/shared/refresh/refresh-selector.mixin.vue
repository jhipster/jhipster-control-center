<template>
  <div class="dropdown">
    <button class="btn btn-outline-primary" v-on:click="manualRefresh()">
      <span class="times-text">Refresh now <em class="fa fa-refresh"></em></span>
    </button>
    <b-dropdown ref="dd" variant="outline-primary" right>
      <span slot="button-content"><em v-bind:class="classTime()"></em>{{ htmlActiveRefreshTime }} &nbsp;</span>
      <span class="dropdown-header">Refresh times (in seconds)</span>
      <div v-for="time in refreshTimes" :key="time">
        <button
          class="dropdown-item"
          v-on:click="[setActiveRefreshTime(time), (htmlActiveRefreshTime = getActiveRefreshTime()), $refs.dd.hide()]"
          v-bind:class="stateTime(time)"
        >
          <span v-if="time > 0">{{ time }}</span>
          <span v-else>disabled</span>
        </button>
      </div>
    </b-dropdown>
  </div>
</template>

<script lang="ts" src="./refresh-selector.mixin.ts"></script>

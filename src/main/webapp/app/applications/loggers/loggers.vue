<template>
  <div>
    <div class="head">
      <h2 id="logs-page-heading" class="d-inline-block" data-cy="logsPageHeading">Loggers</h2>
      <routes-selector class="float-right refresh-left-side mr-1"></routes-selector>
    </div>

    <div v-if="isError">
      <span v-html="renderErrorMessage()"></span>
    </div>
    <div v-else>
      <div v-if="loggers">
        <p>There are {{ loggers.length }} loggers.</p>

        <span>Filter</span> <input type="text" v-model="filtered" class="form-control" />

        <table class="table table-sm table-striped table-bordered">
          <caption>
            Application loggers list
          </caption>
          <thead>
            <tr title="click to order">
              <th scope="col" v-on:click="changeOrder('name')"><span>Name</span></th>
              <th scope="col" v-on:click="changeOrder('level')"><span>Level</span></th>
            </tr>
          </thead>

          <tr v-for="logger in orderBy(filterBy(loggers, filtered), orderProp, reverse === true ? 1 : -1)" :key="logger.name">
            <td>
              <small>{{ logger.name }}</small>
            </td>
            <td>
              <button
                v-on:click="changeLevel(logger.name, 'TRACE')"
                :class="logger.level === 'TRACE' ? 'btn-primary' : 'btn-light'"
                class="btn btn-sm"
              >
                TRACE
              </button>
              <button
                v-on:click="changeLevel(logger.name, 'DEBUG')"
                :class="logger.level === 'DEBUG' ? 'btn-success' : 'btn-light'"
                class="btn btn-sm"
              >
                DEBUG
              </button>
              <button
                v-on:click="changeLevel(logger.name, 'INFO')"
                :class="logger.level === 'INFO' ? 'btn-info' : 'btn-light'"
                class="btn btn-sm"
              >
                INFO
              </button>
              <button
                v-on:click="changeLevel(logger.name, 'WARN')"
                :class="logger.level === 'WARN' ? 'btn-warning' : 'btn-light'"
                class="btn btn-sm"
              >
                WARN
              </button>
              <button
                v-on:click="changeLevel(logger.name, 'ERROR')"
                :class="logger.level === 'ERROR' ? 'btn-danger' : 'btn-light'"
                class="btn btn-sm"
              >
                ERROR
              </button>
              <button
                v-on:click="changeLevel(logger.name, 'OFF')"
                :class="logger.level === 'OFF' ? 'btn-secondary' : 'btn-light'"
                class="btn btn-sm"
              >
                OFF
              </button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./loggers.component.ts"></script>

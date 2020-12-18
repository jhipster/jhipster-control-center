<template>
  <div>
    <div class="head mb-3">
      <h2 id="caches-page-heading" class="d-inline-block" data-cy="caches-page-heading">Caches</h2>
      <refresh-selector class="float-right"></refresh-selector>
      <routes-selector class="float-right mr-2"></routes-selector>
    </div>

    <div v-if="isError">
      <span v-html="renderErrorMessage()"></span>
    </div>
    <div v-else>
      <div v-if="cachesMetrics && caches">
        <h4 id="statistics">Statistics</h4>
        <div class="input-group input-group-md mb-1">
          <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm">Filter</span>
          </div>
          <input type="text" v-model="filteredMetrics" v-on:input="clearPaginationMetrics()" class="form-control" />
        </div>
        <table class="table table-bordered table-striped" aria-describedby="statistics">
          <thead class="thead-light">
            <tr>
              <th scope="col" v-on:click="[changeOrderMetrics('name'), clearPaginationMetrics()]">Cache name</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('hit'), clearPaginationMetrics()]">Cache Hits</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('miss'), clearPaginationMetrics()]">Cache Misses</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('gets'), clearPaginationMetrics()]">Cache Gets</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('puts'), clearPaginationMetrics()]">Cache Puts</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('removals'), clearPaginationMetrics()]">Cache Removals</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('hitPercent'), clearPaginationMetrics()]">Cache Hit %</th>
              <th scope="col" class="text-right" v-on:click="[changeOrderMetrics('missPercent'), clearPaginationMetrics()]">
                Cache Miss %
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(metric, index) in cachesMetricsPaginate" :key="index">
              <td>{{ metric.name }}</td>
              <td class="text-right">{{ metric.hit }}</td>
              <td class="text-right">{{ metric.miss }}</td>
              <td class="text-right">{{ metric.gets }}</td>
              <td class="text-right">{{ metric.puts }}</td>
              <td class="text-right">{{ metric.removals }}</td>
              <td class="text-right">{{ metric.hitPercent }}</td>
              <td class="text-right">{{ metric.missPercent }}</td>
            </tr>
          </tbody>
        </table>
        <div v-show="cachesMetrics && cachesMetrics.length > 0">
          <div class="row justify-content-center">
            <b-pagination
              size="md"
              :total-rows="cachesMetricsFiltered.length"
              v-model="pageMetrics"
              :per-page="itemsPerPageMetrics"
              :change="loadPageMetrics(pageMetrics)"
            ></b-pagination>
          </div>
        </div>
        <h4 id="cachesList">Caches list</h4>
        <div class="input-group input-group-md mb-1">
          <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm">Filter</span>
          </div>
          <input type="text" v-model="filtered" v-on:input="clearPagination()" class="form-control" />
        </div>
        <table class="table table-bordered" aria-describedby="cachesList">
          <thead class="thead-light">
            <tr title="click to order">
              <th scope="col" v-on:click="[changeOrder('cacheManager'), clearPagination()]"><span>Cache Manager</span></th>
              <th scope="col" v-on:click="[changeOrder('name'), clearPagination()]"><span>Cache Name</span></th>
              <th scope="col" v-on:click="[changeOrder('target'), clearPagination()]"><span>Target</span></th>
              <th scope="col" class="text-center"><span>Evict</span></th>
            </tr>
          </thead>
          <tr v-for="cache in cachesPaginate" :key="cache.name">
            <td>{{ cache.cacheManager }}</td>
            <td>{{ cache.name }}</td>
            <td>{{ cache.target }}</td>
            <td>
              <div class="text-center">
                <a v-on:click="confirmEviction(cache.name, cache.cacheManager)">
                  <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                </a>
              </div>
            </td>
          </tr>
        </table>
        <div v-show="caches && caches.length > 0">
          <div class="row justify-content-center">
            <b-pagination
              size="md"
              :total-rows="cachesFiltered.length"
              v-model="page"
              :per-page="itemsPerPage"
              :change="loadPage(page)"
            ></b-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./caches.component.ts"></script>

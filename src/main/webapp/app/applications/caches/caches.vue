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
                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <thead class="thead-light">
                            <h4>Statistics</h4>
                            <tr>
                            <th scope="col">Cache name</th>
                            <th scope="col" class="text-right">Cache Hits</th>
                            <th scope="col" class="text-right">Cache Misses</th>
                            <th scope="col" class="text-right">Cache Gets</th>
                            <th scope="col" class="text-right">Cache Puts</th>
                            <th scope="col" class="text-right">Cache Removals</th>
                            <th scope="col" class="text-right">Cache Hit %</th>
                            <th scope="col" class="text-right">Cache Miss %</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(entry, key) of cachesMetrics" :key="key">
                                <td>{{ key }}</td>
                                <td class="text-right">{{ entry['cache.gets.hit'] }}</td>
                                <td class="text-right">{{ entry['cache.gets.miss'] }}</td>
                                <td class="text-right">{{ entry['cache.gets.hit'] + entry['cache.gets.miss'] }}</td>
                                <td class="text-right">{{ entry['cache.puts'] }}</td>
                                <td class="text-right">{{ entry['cache.removals'] }}</td>
                                <td class="text-right">
                                    {{ formatNumber2(filterNaN((100 * entry['cache.gets.hit']) / (entry['cache.gets.hit'] + entry['cache.gets.miss']))) }}
                                </td>
                                <td class="text-right">
                                    {{ formatNumber2(filterNaN((100 * entry['cache.gets.miss']) / (entry['cache.gets.hit'] + entry['cache.gets.miss']))) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h4>Caches list</h4>
                <div class="input-group input-group-md mb-1">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="inputGroup-sizing-sm">Filter</span>
                    </div>
                    <input type="text" v-model="filtered" class="form-control">
                </div>
                <table class="table table-bordered">
                    <thead class="thead-light">
                    <tr title="click to order">
                        <th scope="col" v-on:click="changeOrder('cacheManager')"><span>Cache Manager</span></th>
                        <th scope="col" v-on:click="changeOrder('name')"><span>Cache Name</span></th>
                        <th scope="col" v-on:click="changeOrder('target')"><span>Target</span></th>
                        <th scope="col" class="text-center"><span>Evict</span></th>
                    </tr>
                    </thead>
                    <tr v-for="cache in orderBy(filterBy(caches, filtered), orderProp, reverse === true ? 1 : -1)" :key="cache.name">
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
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./caches.component.ts"></script>

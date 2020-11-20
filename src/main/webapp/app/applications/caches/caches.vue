<template>
    <div>
        <div class="head">
            <h2 id="caches-page-heading" class="d-inline-block" data-cy="caches-page-heading">Caches</h2>
            <routes-selector class="float-right mr-1 refresh-left-side"></routes-selector>
        </div>


        <div>
            <div v-if="caches">
                <span>Filter</span> <input type="text" v-model="filtered" class="form-control">

                <table class="table table-sm table-striped table-bordered">
                    <thead>
                    <tr title="click to order">
                        <th scope="col" v-on:click="changeOrder('name')"><span>Name</span></th>
                        <th scope="col" v-on:click="changeOrder('cacheManager')"><span>Manager</span></th>
                        <th scope="col" v-on:click="changeOrder('target')"><span>Target</span></th>
                        <th scope="col" class="text-center"><span>Evict</span></th>
                    </tr>
                    </thead>

                    <tr v-for="cache in orderBy(filterBy(caches, filtered), orderProp, reverse === true ? 1 : -1)" :key="cache.name">
                        <td><small>{{ cache.name }}</small></td>
                        <td><small>{{ cache.cacheManager }}</small></td>
                        <td><small>{{ cache.target }}</small></td>
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

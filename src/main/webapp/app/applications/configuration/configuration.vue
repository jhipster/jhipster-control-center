<template>
    <div>
        <div class="head">
            <h2 id="configuration-page-heading" class="d-inline-block">Configuration</h2>
            <routes-selector class="float-right refresh-left-side"></routes-selector>
        </div>

        <div v-if="allBeans && beans">
        <span>Filter (by prefix)</span> <input type="text" v-model="beansFilter" v-on:input="filterAndSortBeans()" class="form-control">

        <h3 id="spring-configuration">Spring configuration</h3>

        <table class="table table-striped table-bordered table-responsive d-table table-dark" aria-describedby="spring-configuration">
            <thead>
                <tr>
                    <th class="w-40" v-on:click="changeOrder('prefix')"><span class="mr-1">Prefix</span><font-awesome-icon icon="sort" /></th>
                    <th class="w-60" v-on:click="changeOrder('properties')"><span class="mr-1">Properties</span><font-awesome-icon icon="sort" /></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(bean, key, index) in orderBy(beans, orderProp, beansAscending === true ? 1 : -1)" :key="index">
                    <td><span>{{ bean.prefix }}</span></td>
                    <td>
                        <div class="row" v-for="(property, key, index) in bean.properties" :key="index">
                            <div class="col-md-4">{{ key }}</div>
                            <div class="col-md-8">
                                <span class="float-right badge-dark break">{{ property }}</span>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-for="(propertySource, key, index) in propertySources" :key="index">
            <h4><span>{{ propertySource.name }}</span></h4>

            <table class="table table-sm table-striped table-bordered table-responsive d-table table-dark">
                <thead>
                    <tr>
                        <th scope="col" class="w-40">Property</th>
                        <th scope="col" class="w-60">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(property, key, index) in propertySource.properties" :key="index">
                        <td class="break">{{ key }}</td>
                        <td class="break">
                            <span class="float-right badge-dark break">{{ property.value }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
    </div>
</template>

<script lang="ts" src="./configuration.component.ts"></script>

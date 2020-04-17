<template>
    <div>
        <div class="head">
            <h2 class="d-inline-block">Application Instances</h2>
            <refresh-selector class="float-right refresh-left-side">button</refresh-selector>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-bordered table-responsive d-table">
                <thead>
                <tr>
                    <th class="w-50">Service</th>
                    <th class="w-50">Instance</th>
                    <th>Detail</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="content in applications" :key="content.instance.instanceId">
                    <td class="table-hover">
                        <a :href="content.instance.uri" target="_blank">{{ content.instance.serviceId }}</a>
                    </td>
                    <td class="table-hover">
                        <span class="badge badge-pill badge-light">{{ content.instance.instanceId }}</span>
                    </td>
                    <td class="text-center">
                        <a id="showDetail" class="hand" v-on:click="showApplication(content, content.instance.uri)" v-if="content">
                            <font-awesome-icon icon="eye"></font-awesome-icon>
                        </a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <b-modal ref="applicationModal">
            <h4 slot="modal-title" v-if="currentApplication && currentRoute" class="modal-title" id="showApplicationLabel">
                <span class="text-capitalize">{{ currentApplication.serviceId }}</span>
            </h4>
            <applications-modal :current-application="currentApplication" :current-route="currentRoute"></applications-modal>
        </b-modal>
    </div>
</template>

<script lang="ts" src="./applications.component.ts"></script>

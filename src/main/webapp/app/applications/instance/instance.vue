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
                <tr v-for="instance in instances" :key="instance.instanceId">
                    <td class="table-hover">
                        <a :href="instance.uri" target="_blank">{{ instance.serviceId }}</a>
                    </td>
                    <td class="table-hover">
                        <span class="badge badge-pill badge-light">{{ instance.instanceId }}</span>
                    </td>
                    <td class="text-center">
                        <a id="showDetail" class="hand" v-on:click="showInstance(instance, instance.uri)" v-if="instance">
                            <font-awesome-icon icon="eye"></font-awesome-icon>
                        </a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <b-modal ref="instanceModal">
            <h4 slot="modal-title" v-if="selectedInstance && selectedInstanceRoute" class="modal-title" id="showInstanceLabel">
                <span class="text-capitalize">{{ selectedInstance.serviceId }}</span>
            </h4>
            <instance-modal :selected-instance="selectedInstance" :selected-instance-route="selectedInstanceRoute"></instance-modal>
        </b-modal>
    </div>
</template>

<script lang="ts" src="./instance.component.ts">
</script>

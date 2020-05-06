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
                    <th class="w-20">Service</th>
                    <th class="w-30">Instance</th>
                    <th class="w-30">Profile</th>
                    <th class="w-30">Git</th>
                    <th class="text-center">Details</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="instance in instances" :key="instance.instanceId">
                    <td class="table-hover">
                        <a :href="instance.uri" target="_blank">{{ instance.serviceId }}</a>
                    </td>
                    <td class="table-hover">
                        <span class="badge badge-ligth">{{ instance.instanceId }}</span><br/>
                    </td>
                    <td class="table-hover">
                        <span class="badge badge-success">{{ instance.metadata.profile }}</span>
                        <span class="badge badge-primary">{{ instance.metadata.version }}</span>
                    </td>
                    <td class="table-hover">
                        <span v-if="instance.metadata.hasOwnProperty('git-commit') && instance.metadata['git-commit']"
                              class="badge badge-dark">
                                    {{ instance.metadata["git-commit"] }}
                        </span>
                        <span v-if="instance.metadata.hasOwnProperty('git-branch') && instance.metadata['git-branch']"
                              class="badge badge-dark">
                                    {{ instance.metadata["git-branch"] }}
                        </span>
                    </td>
                    <td class="table-hover">
                        <div class="text-center">
                            <a id="showDetail" class="hand" v-on:click="showInstance(instance, instance.uri)" v-if="instance">
                                <font-awesome-icon icon="eye"></font-awesome-icon>
                            </a>
                        </div>
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

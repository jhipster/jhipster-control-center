<template>
    <div>
        <h2>
            <span id="health-page-heading">Health Checks</span>
            <routes-selector  class="float-right refresh-left-side"></routes-selector>
        </h2>
        <div v-if="isError">
            <span v-html="renderErrorMessage()"></span>
        </div>
        <div v-else class="table-responsive">
            <table id="healthCheck" class="table table-striped">
                <caption>Application health</caption>
                <thead>
                <tr>
                    <th scope="col">Service Name</th>
                    <th scope="col" class="text-center">Status</th>
                    <th scope="col" class="text-center">Details</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="health of healthData" :key="health.name">
                    <td><span class="text-capitalize">{{ baseName(health.name) }}</span> {{subSystemName(health.name)}}</td>
                    <td class="text-center">
                        <span class="badge" :class="getBadgeClass(health.status)">
                            {{health.status}}
                        </span>
                    </td>
                    <td class="text-center">
                        <a class="hand" v-on:click="showHealth(health)" v-if="health.details || health.error">
                            <font-awesome-icon icon="eye"></font-awesome-icon>
                        </a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <b-modal ref="healthModal">
            <h4 slot="modal-title" v-if="currentHealth" class="modal-title" id="showHealthLabel"> <span class="text-capitalize">{{ baseName(currentHealth.name) }}</span>
                {{subSystemName(currentHealth.name)}}
            </h4>
            <health-modal :current-health="currentHealth"></health-modal>
        </b-modal>


    </div>

</template>


<script lang="ts" src="./health.component.ts">
</script>

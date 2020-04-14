<template>
    <div class="modal-body pad">
        <div v-if="currentApplication && currentRoute">
            <div class="table">
                <table class="table table-bordered">
                    <tbody>
                        <tr>
                            <td class="text-left align-middle">
                                <div>URI</div>
                            </td>
                            <td class="text-left">
                                <a :href="currentApplication.instance.uri" target="_blank">
                                    {{currentApplication.instance.uri}}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Port
                            </td>
                            <td class="text-left">
                                {{currentApplication.instance.port}}
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Secure
                            </td>
                            <td class="text-left">
                                {{currentApplication.instance.secure}}
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Route
                            </td>
                            <td class="text-left">
                                <span class="badge badge-pill badge-info">
                                    {{currentRoute}}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="activeProfiles">
                            <td class="text-left">
                                Active Profiles
                            </td>
                            <td class="text-left align-middle">
                                <span v-for="content in activeProfiles.activeProfiles" v-bind:key="content" class="badge badge-pill badge-success mr-2">
                                    {{ content }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="currentApplication.instance.metadata && currentApplication.instance.metadata.profile">
                            <td class="text-left">
                                Profile
                            </td>
                            <td class="text-left">
                                <span class="badge badge-pill badge-primary">{{currentApplication.instance.metadata.profile}}</span>
                            </td>
                        </tr>
                        <tr v-if="currentApplication.instance.metadata && currentApplication.instance.metadata.version">
                            <td class="text-left">
                                Version
                            </td>
                            <td class="text-left">
                                <span class="badge badge-pill badge-primary">{{currentApplication.instance.metadata.version}}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="currentRoute && currentRoute.error">
            <h4>Error</h4>
            <pre>{{currentRoute.error}}</pre>
        </div>
    </div>
</template>

<script lang="ts" src="./applications-modal.component.ts">
</script>

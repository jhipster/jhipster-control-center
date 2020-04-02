<template>
    <div class="modal-body pad">
        <div v-if="currentApplication">
            <div class="table">
                <table class="table table-bordered">
                    <tbody>
                        <tr>
                            <td class="text-left align-middle">
                                <div>URI</div>
                            </td>
                            <td class="text-left">
                                <a :href="currentApplication.uri" target="_blank">
                                    {{currentApplication.uri}}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Port
                            </td>
                            <td class="text-left">
                                {{currentApplication.port}}
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Secure
                            </td>
                            <td class="text-left">
                                {{currentApplication.secure}}
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Profile
                            </td>
                            <td class="text-left">
                                <span class="badge badge-pill badge-primary">{{currentApplication.metadata.profile}}</span>
                            </td>
                        </tr>
                        <tr>
                            <td class="text-left">
                                Version
                            </td>
                            <td class="text-left">
                                <span class="badge badge-pill badge-primary">{{currentApplication.metadata.version}}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="currentApplication && currentApplication.error">
            <h4>Error</h4>
            <pre>{{currentApplication.error}}</pre>
        </div>
    </div>
</template>

<script lang="ts" src="./applications-modal.component.ts">
</script>

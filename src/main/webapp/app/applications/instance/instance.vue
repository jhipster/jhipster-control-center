<template>
  <div>
    <div class="head">
      <h2 class="d-inline-block">Application Instances</h2>
      <refresh-selector class="float-right refresh-left-side">button</refresh-selector>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-bordered table-responsive d-table" aria-describedby="applicationInstances">
        <thead>
          <tr>
            <th scope="col" class="w-20">Service</th>
            <th scope="col" class="w-30">Instance</th>
            <th scope="col" class="w-30">Profile</th>
            <th scope="col" class="w-30">Version</th>
            <th scope="col" class="w-30">Status</th>
            <th scope="col" class="text-center">Detail</th>
            <th scope="col" class="text-center" v-if="isStaticProfile">Remove</th>
            <th scope="col" class="text-center">Kill</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="instance in instances" :key="instance.instanceId">
            <td class="table-hover">
              <a :href="instance.uri" target="_blank">{{ instance.serviceId }}</a>
            </td>
            <td class="table-hover">
              <span class="badge badge-ligth">{{ instance.instanceId }}</span
              ><br />
            </td>
            <td class="table-hover">
              <span v-for="profile in instance.metadata.profile" :key="profile" class="badge badge-success">{{ profile }}</span>
              <span class="badge badge-primary">{{ instance.metadata.version }}</span>
            </td>
            <td class="table-hover">
              <span class="badge badge-dark"> {{ versionInstance(instance) }}</span>
            </td>
            <td class="table-hover">
              <span class="badge" :class="getBadgeClass(instance.metadata.status)">{{ instance.metadata.status }}</span>
            </td>
            <td class="table-hover">
              <div class="text-center">
                <a id="showDetail" class="hand" v-on:click="showInstance(instance, instance.uri)" v-if="instance">
                  <font-awesome-icon icon="eye"></font-awesome-icon>
                </a>
              </div>
            </td>
            <td class="table-hover" v-if="isStaticProfile">
              <div class="text-center">
                <a id="shutdownInstance" v-on:click="confirmRemoveStaticInstance(instance)">
                  <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                </a>
              </div>
            </td>
            <td class="table-hover">
              <div class="text-center">
                <a id="shutdownInstance" v-on:click="confirmShutdown(instance)" v-if="instance.serviceId !== 'consul'">
                  <font-awesome-icon icon="power-off"></font-awesome-icon>
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <b-modal ref="instanceModal" ok-only ok-title="Close">
      <h4 slot="modal-title" v-if="selectedInstance && selectedInstanceRoute" class="modal-title" id="showInstanceLabel">
        <span class="text-capitalize">{{ selectedInstance.serviceId }}</span>
      </h4>
      <instance-modal :selected-instance="selectedInstance" :selected-instance-route="selectedInstanceRoute"></instance-modal>
    </b-modal>
    <div v-if="isStaticProfile">
      <b-button ref="newStaticInstanceButton" v-b-modal.newStaticInstanceModal><font-awesome-icon icon="plus" /></b-button>
      <b-modal
        id="newStaticInstanceModal"
        ref="newStaticInstanceModal"
        title="Add a new static instance"
        @hidden="onHiddenAddStaticInstance"
        hide-footer
      >
        <b-form v-on:submit.prevent="onSubmitAddStaticInstance">
          <b-form-group id="serviceName" label="Service Name" label-for="serviceNameInput">
            <b-form-input
              id="serviceNameInput"
              ref="serviceNameInput"
              v-model="inputServiceName"
              type="text"
              placeholder="Service"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="URL" label="URL" label-for="URLInput">
            <b-form-input
              id="URLInput"
              ref="URLInput"
              v-model="inputURL"
              type="url"
              placeholder="http://localhost:8080"
              required
            ></b-form-input>
          </b-form-group>

          <div class="float-right">
            <b-button ref="newStaticInstanceSubmitButton" type="submit" variant="primary">Submit</b-button>
            <b-button ref="newStaticInstanceCloseButton" @click="onHiddenAddStaticInstance">Cancel</b-button>
          </div>
        </b-form>
      </b-modal>
    </div>
  </div>
</template>

<script lang="ts" src="./instance.component.ts"></script>

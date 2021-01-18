<template>
  <div>
    <div class="head mb-3">
      <h2 id="liquibase-page-heading" class="d-inline-block" data-cy="liquibase-page-heading">Liquibase</h2>
      <refresh-selector class="float-right"></refresh-selector>
      <routes-selector class="float-right mr-2"></routes-selector>
    </div>

    <div v-if="isError">
      <span v-html="renderErrorMessage()"></span>
    </div>
    <div v-else>
      <div v-if="changeSets">
        <h4 id="changeSetsList">ChangeSet list</h4>
        <div class="input-group input-group-md mb-1">
          <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm">Filter</span>
          </div>
          <input type="text" v-model="filtered" v-on:input="clearPagination()" class="form-control" />
        </div>
        <table class="table table-bordered col-md-12" aria-describedby="changeSetsList">
          <thead class="thead-light">
            <tr title="click to order">
              <th scope="col" v-on:click="[changeOrder('id'), clearPagination()]"><span>ID</span></th>
              <th scope="col" v-on:click="[changeOrder('deploymentId'), clearPagination()]"><span>Deployment</span></th>
              <th scope="col" v-on:click="[changeOrder('author'), clearPagination()]"><span>Author</span></th>
              <th scope="col" v-on:click="[changeOrder('changeLog'), clearPagination()]"><span>ChangeLog</span></th>
              <th scope="col" v-on:click="[changeOrder('dateExecuted'), clearPagination()]"><span>Executed</span></th>
              <th scope="col" v-on:click="[changeOrder('execType'), clearPagination()]"><span>ExecType</span></th>
              <th scope="col" v-on:click="[changeOrder('checksum'), clearPagination()]"><span>Checksum</span></th>
              <th scope="col" v-on:click="[changeOrder('orderExecuted'), clearPagination()]"><span>Order</span></th>
              <th scope="col"><span>Detail</span></th>
            </tr>
          </thead>
          <tr v-for="changeSet in changeSetsPaginate" :key="changeSet.id">
            <td>
              <span class="badge badge-ligth">{{ changeSet.id }}</span>
            </td>
            <td>
              <span class="badge badge-ligth">{{ changeSet.deploymentId }}</span>
            </td>
            <td>{{ changeSet.author }}</td>
            <td>
              <span class="badge badge-ligth">{{ changeSet.changeLog }}</span>
            </td>
            <td>{{ changeSet.dateExecuted }}</td>
            <td>{{ changeSet.execType }}</td>
            <td>
              <span class="badge badge-ligth"> {{ changeSet.checksum }} </span>
            </td>
            <td class="text-center">{{ changeSet.orderExecuted }}</td>
            <td class="table-hover">
              <div class="text-center">
                <a id="showDetail" class="hand" v-on:click="showDetail(changeSet)">
                  <font-awesome-icon icon="eye"></font-awesome-icon>
                </a>
              </div>
            </td>
          </tr>
        </table>
        <!-- Detail Modal Begin -->
        <b-modal ref="detailModal" ok-only ok-title="Close" size="xl" scrollable>
          <b-container v-if="selectedChangeSet">
            <b-row class="mb-2">
              <b-col>
                <b-card>
                  <b-row>
                    <b-col>
                      <p class="badge badge-ligth text-center">
                        <span>ID : {{ selectedChangeSet.id }}</span>
                      </p>
                      <br />
                      <p class="badge badge-ligth text-center">
                        <span v-if="!selectedChangeSet.parentId">Parent ID : No parent id</span>
                        <span v-else>Parent ID : {{ selectedChangeSet.parentId }}</span>
                      </p>
                      <br />
                      <p class="badge badge-ligth text-center">
                        <span v-if="!selectedChangeSet.tag">Tag : No tag</span>
                        <span v-else>Tag : {{ selectedChangeSet.tag }}</span>
                      </p>
                    </b-col>
                    <b-col class="text-right">
                      <span class="badge badge-ligth">Comments</span>
                      <p>
                        <span v-if="!selectedChangeSet.comments">No comments</span>
                        <span v-else>{{ selectedChangeSet.comments }}</span>
                      </p>
                    </b-col>
                  </b-row>
                </b-card>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <table class="table" aria-describedby="changeType">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col">Change Type</th>
                    </tr>
                  </thead>
                  <tr v-for="description in selectedChangeSet.description" :key="description.index">
                    <td>{{ description }}</td>
                  </tr>
                </table>
              </b-col>
              <b-col>
                <table class="table" aria-describedby="contexts">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col">Contexts</th>
                    </tr>
                  </thead>
                  <tr v-if="!selectedChangeSet.contexts.length">
                    <td class="text-center">No context</td>
                  </tr>
                  <tr v-else v-for="context in selectedChangeSet.contexts" :key="context.index">
                    <td>{{ context }}</td>
                  </tr>
                </table>
              </b-col>
              <b-col>
                <table class="table" aria-describedby="labels">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col">Labels</th>
                    </tr>
                  </thead>
                  <tr v-if="!selectedChangeSet.labels.length">
                    <td class="text-center">No label</td>
                  </tr>
                  <tr v-else v-for="label in selectedChangeSet.labels" :key="label.index">
                    <td>{{ label }}</td>
                  </tr>
                </table>
              </b-col>
            </b-row>
          </b-container>
        </b-modal>
        <!-- Detail Modal End -->
        <div v-show="changeSets && changeSets.length > 0">
          <div class="row justify-content-center">
            <b-pagination
              size="md"
              :total-rows="changeSetsFiltered.length"
              v-model="page"
              :per-page="itemsPerPage"
              :change="loadPage(page)"
            ></b-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./liquibase.component.ts"></script>

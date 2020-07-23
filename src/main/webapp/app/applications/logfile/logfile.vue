<template>
  <div>
    <div class="head">
      <h2 class="d-inline-block">View Logs</h2>
      <refresh-selector class="float-right refresh-left-side">button</refresh-selector>
      <routes-selector class="float-right refresh-left-side mr-2"></routes-selector>
    </div>
    <div v-if="isError">
      <span v-html="renderErrorMessage()"></span>
    </div>
    <div v-else>
      <div>
        <div class="to-bottom" v-if="logFileContent" @click="scrollToBottom()"><i class="fa fa-arrow-circle-down"></i> Bottom</div>
        <div class="form-group">
          <textarea v-model="logFileContent" id="logfile" readonly class="form-control log-viewer" rows="25"></textarea>
        </div>
        <div class="to-top" v-if="logFileContent" @click="scrollToTop()"><i class="fa fa-arrow-circle-up"></i> Top</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./logfile.component.ts"></script>
<style scoped lang="scss" src="./logfile.scss"></style>

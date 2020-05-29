<template>
  <div>
    <refresh-selector class="float-right"></refresh-selector>
    <routes-selector  class="float-right mr-2"></routes-selector>
    <h2>
      <span id="metrics-page-heading">Application Metrics</span>
    </h2>

    <h3>JVM Metrics</h3>
    <div class="row" v-if="!updatingMetrics">
      <div class="col-md-4">
        <h4>Memory</h4>
        <div>
          <div v-for="(entry, key) of metrics.jvm" :key="key">
            <span v-if="entry.max !== -1">
              <span>{{key}}</span> ({{formatNumber1(entry.used / 1048576)}}M / {{formatNumber1(entry.max / 1048576)}}M)
            </span>
            <span v-else>
              <span>{{key}}</span> {{formatNumber1(entry.used / 1048576)}}M
            </span>
            <div>Committed : {{formatNumber1(entry.committed / 1048576)}}M</div>
            <b-progress v-if="entry.max !== -1" variant="success" animated :max="entry.max" striped >
              <b-progress-bar :value="entry.used" :label="formatNumber1(entry.used * 100 / entry.max) + '%'"></b-progress-bar>
            </b-progress>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <h4>Threads </h4>
        <span><span>Runnable</span> {{threadStats.threadDumpRunnable}}</span>
        <b-progress variant="success" :max="threadStats.threadDumpAll" striped >
          <b-progress-bar :value="threadStats.threadDumpRunnable" :label="formatNumber1(threadStats.threadDumpRunnable * 100 / threadStats.threadDumpAll) + '%'"></b-progress-bar>
        </b-progress>

        <span><span>Timed Waiting</span> ({{threadStats.threadDumpTimedWaiting}})</span>
        <b-progress variant="warning" :max="threadStats.threadDumpAll" striped >
          <b-progress-bar :value="threadStats.threadDumpTimedWaiting" :label="formatNumber1(threadStats.threadDumpTimedWaiting * 100 / threadStats.threadDumpAll) + '%'"></b-progress-bar>
        </b-progress>

        <span><span>Waiting</span> ({{threadStats.threadDumpWaiting}})</span>
        <b-progress variant="info" :max="threadStats.threadDumpAll" striped >
          <b-progress-bar :value="threadStats.threadDumpWaiting" :label="formatNumber1(threadStats.threadDumpWaiting * 100 / threadStats.threadDumpAll) + '%'"></b-progress-bar>
        </b-progress>

        <span><span>Blocked</span> ({{threadStats.threadDumpBlocked}})</span>
        <b-progress variant="danger" :max="threadStats.threadDumpAll" striped >
          <b-progress-bar :value="threadStats.threadDumpBlocked" :label="formatNumber1(threadStats.threadDumpBlocked * 100 / threadStats.threadDumpAll) + '%'"></b-progress-bar>
        </b-progress>

        <span>Total: {{threadStats.threadDumpAll}}
          <a class="hand" v-b-modal.metricsModal
            data-toggle="modal"
            v-on:click="openModal()"
            data-target="#threadDump">
            <font-awesome-icon icon="eye"></font-awesome-icon>
          </a>
        </span>

      </div>
      <div class="col-md-4">
        <h4>System</h4>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-4">Uptime</div>
          <div class="col-md-8 text-right">{{convertMillisecondsToDuration(metrics.processMetrics["process.uptime"])}}</div>
        </div>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-4">Start time</div>
          <div class="col-md-8 text-right">{{metrics.processMetrics["process.start.time"] | formatMillis}}</div>
        </div>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-9">Process CPU usage</div>
          <div class="col-md-3 text-right">{{formatNumber2(100 * metrics.processMetrics["process.cpu.usage"])}} %</div>
        </div>
        <b-progress variant="success" :max="100" striped >
          <b-progress-bar :value="100 * metrics.processMetrics['process.cpu.usage']"
            :label="formatNumber1(100 * metrics.processMetrics['process.cpu.usage']) + '%'">
          </b-progress-bar>
        </b-progress>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-9">System CPU usage</div>
          <div class="col-md-3 text-right">{{formatNumber2(100 * metrics.processMetrics["system.cpu.usage"])}} %</div>
        </div>
        <b-progress variant="success" :max="100" striped >
          <b-progress-bar :value="100 * metrics.processMetrics['system.cpu.usage']"
            :label="formatNumber1(100 * metrics.processMetrics['system.cpu.usage']) + '%'">
          </b-progress-bar>
        </b-progress>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-9">System CPU count</div>
          <div class="col-md-3 text-right">{{metrics.processMetrics["system.cpu.count"]}}</div>
        </div>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-9">System 1m Load average</div>
          <div class="col-md-3 text-right">{{formatNumber2(metrics.processMetrics["system.load.average.1m"])}}</div>
        </div>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-9">Process files max</div>
          <div class="col-md-3 text-right">{{formatNumber1(metrics.processMetrics["process.files.max"])}}</div>
        </div>
        <div class="row" v-if="!updatingMetrics">
          <div class="col-md-9">Process files open</div>
          <div class="col-md-3 text-right">{{formatNumber1(metrics.processMetrics["process.files.open"])}}</div>
        </div>
      </div>
    </div>

    <h3>Garbage collections</h3>
    <div class="row" v-if="!updatingMetrics && isMetricKeyExists(metrics, 'garbageCollector')">
      <div class="col-md-4">
        <div>
          <span>
            GC Live Data Size/GC Max Data Size
            ({{formatNumber1(metrics.garbageCollector['jvm.gc.live.data.size'] / 1048576)}}M
            / {{formatNumber1(metrics.garbageCollector['jvm.gc.max.data.size'] / 1048576)}}M)
          </span>
          <b-progress variant="success" :max="metrics.garbageCollector['jvm.gc.max.data.size']" striped >
            <b-progress-bar :value="metrics.garbageCollector['jvm.gc.live.data.size']"
              :label="formatNumber2(100 * metrics.garbageCollector['jvm.gc.live.data.size'] / metrics.garbageCollector['jvm.gc.max.data.size']) + '%'">
            </b-progress-bar>
          </b-progress>
        </div>
      </div>
      <div class="col-md-4">
        <div>
          <span>
            GC Memory Promoted/GC Memory Allocated
            ({{formatNumber1(metrics.garbageCollector['jvm.gc.memory.promoted'] / 1048576)}}M
            / {{formatNumber1(metrics.garbageCollector['jvm.gc.memory.allocated'] / 1048576)}}M)
          </span>
          <b-progress variant="success" :max="metrics.garbageCollector['jvm.gc.memory.allocated']" striped >
            <b-progress-bar :value="metrics.garbageCollector['jvm.gc.memory.promoted']"
              :label="formatNumber2(100 * metrics.garbageCollector['jvm.gc.memory.promoted'] / metrics.garbageCollector['jvm.gc.memory.allocated']) + '%'">
            </b-progress-bar>
          </b-progress>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row">
          <div class="col-md-9">Classes loaded</div>
          <div class="col-md-3 text-right">{{metrics.garbageCollector.classesLoaded}}</div>
        </div>
        <div class="row">
          <div class="col-md-9">Classes unloaded</div>
          <div class="col-md-3 text-right">{{metrics.garbageCollector.classesUnloaded}}</div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
          <tr>
            <th></th>
            <th class="text-right">Count</th>
            <th class="text-right">Mean</th>
            <th class="text-right">Min</th>
            <th class="text-right">p50</th>
            <th class="text-right">p75</th>
            <th class="text-right">p95</th>
            <th class="text-right">p99</th>
            <th class="text-right">Max</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>jvm.gc.pause</td>
            <td class="text-right">{{metrics.garbageCollector['jvm.gc.pause'].count}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause'].mean)}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause']['0.0'])}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause']['0.5'])}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause']['0.75'])}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause']['0.95'])}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause']['0.99'])}}</td>
            <td class="text-right">{{formatNumber2(metrics.garbageCollector['jvm.gc.pause'].max)}}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <h3>HTTP requests (time in millisecond)</h3>
    <table class="table table-striped" v-if="!updatingMetrics && isMetricKeyExists(metrics, 'http.server.requests')">
      <thead>
      <tr>
        <th>Code</th>
        <th>Count</th>
        <th class="text-right">Mean</th>
        <th class="text-right">Max</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(entry, key) of metrics['http.server.requests']['percode']" :key="key">
        <td>{{key}}</td>
        <td>
          <b-progress variant="success" animated :max="metrics['http.server.requests']['all'].count" striped >
            <b-progress-bar :value="entry.count" :label="formatNumber1(entry.count)"></b-progress-bar>
          </b-progress>
        </td>
        <td class="text-right">
          {{formatNumber2(filterNaN(entry.mean))}}
        </td>
        <td class="text-right">{{formatNumber2(entry.max)}}</td>
      </tr>
      </tbody>
    </table>

    <h3>Endpoints requests (time in millisecond)</h3>
    <div class="table-responsive" v-if="!updatingMetrics">
      <table class="table table-striped">
        <thead>
        <tr>
          <th>Method</th>
          <th>Endpoint url</th>
          <th class="text-right">Count</th>
          <th class="text-right">Mean</th>
        </tr>
        </thead>
        <tbody>
        <template v-for="(entry, entryKey) of metrics.services">
          <tr v-for="(method, methodKey) of entry" :key="entryKey + '-' + methodKey">
            <td>{{methodKey}}</td>
            <td>{{entryKey}}</td>
            <td class="text-right">{{method.count}}</td>
            <td class="text-right">{{formatNumber2(method.mean)}}</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

    <h3>Cache statistics</h3>
    <div class="table-responsive" v-if="!updatingMetrics && isMetricKeyExists(metrics, 'cache')">
      <table class="table table-striped">
        <thead>
        <tr>
          <th>Cache name</th>
          <th class="text-right" data-translate="metrics.cache.hits">Cache Hits</th>
          <th class="text-right" data-translate="metrics.cache.misses">Cache Misses</th>
          <th class="text-right" data-translate="metrics.cache.gets">Cache Gets</th>
          <th class="text-right" data-translate="metrics.cache.puts">Cache Puts</th>
          <th class="text-right" data-translate="metrics.cache.removals">Cache Removals</th>
          <th class="text-right" data-translate="metrics.cache.evictions">Cache Evictions</th>
          <th class="text-right" data-translate="metrics.cache.hitPercent">Cache Hit %</th>
          <th class="text-right" data-translate="metrics.cache.missPercent">Cache Miss %</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(entry, key) of metrics.cache" :key="key">
          <td>{{key}}</td>
          <td class="text-right">{{entry['cache.gets.hit']}}</td>
          <td class="text-right">{{entry['cache.gets.miss']}}</td>
          <td class="text-right">{{entry['cache.gets.hit'] + entry['cache.gets.miss']}}</td>
          <td class="text-right">{{entry['cache.puts']}}</td>
          <td class="text-right">{{entry['cache.removals']}}</td>
          <td class="text-right">{{entry['cache.evictions']}}</td>
          <td class="text-right">
            {{formatNumber2(filterNaN(100 * entry['cache.gets.hit'] / (entry['cache.gets.hit'] +
            entry['cache.gets.miss'])))}}
          </td>
          <td class="text-right">
            {{formatNumber2(filterNaN(100 * entry['cache.gets.miss'] / (entry['cache.gets.hit'] +
            entry['cache.gets.miss'])))}}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <h3>DataSource statistics (time in millisecond)</h3>
    <div class="table-responsive" v-if="!updatingMetrics && isObjectExistingAndNotEmpty(metrics, 'databases')">
      <table class="table table-striped">
        <thead>
        <tr>
          <th><span>Connection Pool Usage</span>
            (active: {{metrics.databases.active.value}}, min: {{metrics.databases.min.value}}, max:
            {{metrics.databases.max.value}},
            idle: {{metrics.databases.idle.value}})
          </th>
          <th class="text-right">Count</th>
          <th class="text-right">Mean</th>
          <th class="text-right">Min</th>
          <th class="text-right">p50</th>
          <th class="text-right">p75</th>
          <th class="text-right">p95</th>
          <th class="text-right">p99</th>
          <th class="text-right">Max</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>Acquire</td>
          <td class="text-right">{{metrics.databases.acquire.count}}</td>
          <td class="text-right">{{formatNumber2(filterNaN(metrics.databases.acquire.mean))}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.acquire['0.0'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.acquire['0.5'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.acquire['0.75'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.acquire['0.95'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.acquire['0.99'])}}</td>
          <td class="text-right">{{formatNumber2(filterNaN(metrics.databases.acquire.max))}}</td>
        </tr>
        <tr>
          <td>Creation</td>
          <td class="text-right">{{metrics.databases.creation.count}}</td>
          <td class="text-right">{{formatNumber2(filterNaN(metrics.databases.creation.mean))}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.creation['0.0'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.creation['0.5'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.creation['0.75'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.creation['0.95'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.creation['0.99'])}}</td>
          <td class="text-right">{{formatNumber2(filterNaN(metrics.databases.creation.max))}}
          </td>
        </tr>
        <tr>
          <td>Usage</td>
          <td class="text-right">{{metrics.databases.usage.count}}</td>
          <td class="text-right">{{formatNumber2(filterNaN(metrics.databases.usage.mean))}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.usage['0.0'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.usage['0.5'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.usage['0.75'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.usage['0.95'])}}</td>
          <td class="text-right">{{formatNumber2(metrics.databases.usage['0.99'])}}</td>
          <td class="text-right">{{formatNumber2(filterNaN(metrics.databases.usage.max))}}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <b-modal ref="metricsModal" size="lg" ok-only ok-title="Close">
      <h4 slot="modal-title" class="modal-title" id="showMetricsLabel">Threads dump</h4>
      <metrics-modal :thread-dump="threads"></metrics-modal>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./metric.component.ts">
</script>
import { Component, Vue } from 'vue-property-decorator';
import { BEmbed } from 'bootstrap-vue';

@Component({
  components: {
    'b-embed': BEmbed
  }
})
export default class JhiDocs extends Vue {}

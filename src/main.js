import Vue from "vue";
import App from "./App.vue";
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueHighlightJS from 'vue-highlightjs'

Vue.use(Vuetify)
Vue.use(VueHighlightJS)
Vue.config.productionTip = false;

const vuetify = new Vuetify({})

new Vue({
  render: h => h(App),
  vuetify
}).$mount("#app");

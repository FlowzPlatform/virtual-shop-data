import Vue from 'vue';
import iView from 'iview';
import locale from 'iview/dist/locale/en-US';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
// import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from '@/libs/util';
import VueWidgets from 'vue-widgets';
import 'vue-widgets/dist/styles/vue-widgets.css';
const config = require('./config/customConfig.js');

import io from 'socket.io-client';
import socketio from 'feathers-socketio/client';
import Feathers from 'feathers/client';
const vueFeathers = require('vue-feathers');
const hooks = require('feathers-hooks');
const socket = io(config.socketURI, { transports: ['websocket']});
const feathers = Feathers()
  .configure(socketio(socket))
  .configure(hooks())
  
Vue.use(VueI18n);
Vue.use(iView , { locale });
Vue.use(VueWidgets);
Vue.use(vueFeathers, feathers);

Vue.use(VueWidgets);

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    }
});

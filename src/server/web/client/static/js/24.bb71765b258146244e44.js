webpackJsonp([24,48],{"/prh":function(e,t,s){"use strict";var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"btn-group"},[s("button",{ref:"pause",staticClass:"btn btn-outline-dark btn-micro",on:{click:function(t){e.itemAction("pause-item",e.rowData,e.rowIndex)}}},[s("i",{staticClass:"fa fa-pause"})]),e._v(" "),s("button",{ref:"resume",staticClass:"btn btn-outline-dark btn-micro",on:{click:function(t){e.itemAction("resume-item",e.rowData,e.rowIndex)}}},[s("i",{staticClass:"fa fa-play"})]),e._v(" "),s("button",{ref:"stop",staticClass:"btn btn-outline-dark btn-micro",on:{click:function(t){e.itemAction("stop-item",e.rowData,e.rowIndex)}}},[s("i",{staticClass:"fa fa-stop"})])])},n=[],i={render:a,staticRenderFns:n};t.a=i},"4Llf":function(e,t,s){"use strict";var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("vuestic-widget",{attrs:{headerText:e.$t("menu.slaves")}},[s("vuestic-data-table",{ref:"vuesticDataTable",attrs:{apiMode:e.apiMode,apiUrl:e.apiUrl,httpOptions:e.httpOptions,tableFields:e.tableFields,itemsPerPage:e.itemsPerPage,onEachSide:e.onEachSide,sortFunctions:e.sortFunctions}})],1)},n=[],i={render:a,staticRenderFns:n};t.a=i},"4xNv":function(e,t,s){"use strict";t.a={tableFields:[{name:"state",title:"state",callback:"getEquivalentState"},{name:"alias",title:"alias"},{name:"address",title:"address"},{name:"port",title:"port"},{name:"runningInstances",title:"running instances"},{name:"performance.level",title:"performance"},{name:"resource.cpu",title:"cpu being used",sortField:"resource.cpu",callback:"normalizeResource"},{name:"resource.memory",title:"memory being used",sortField:"resource.memory",callback:"normalizeResource"},{name:"__component:slave-custom-actions",title:"commands",titleClass:"text-center",dataClass:"text-center"}],sortFunctions:{name:function(e,t){return e>=t?1:-1}}}},"L/3v":function(e,t,s){t=e.exports=s("FZ+f")(!0),t.push([e.i,"","",{version:3,sources:[],names:[],mappings:"",file:"CustomActions.vue",sourceRoot:""}])},PZmQ:function(e,t,s){"use strict";var a=s("mtWM"),n=s.n(a);t.a={props:{rowData:{type:Object,required:!0},rowIndex:{type:Number}},methods:{itemAction:function(e,t,s){var a=this;"pause-item"===e?(this.$refs.pause.disabled=!0,n.a.post("/api/v1/slave/pause",{id:t._id},{withCredentials:!0}).then(function(){a.$refs.pause.disabled=!1}).catch(function(){a.$refs.pause.disabled=!1})):"resume-item"===e?(this.$refs.resume.disabled=!0,n.a.post("/api/v1/slave/resume",{id:t._id},{withCredentials:!0}).then(function(){a.$refs.resume.disabled=!1}).catch(function(){a.$refs.resume.disabled=!1})):"stop-item"===e&&(this.$refs.stop.disabled=!0,n.a.post("/api/v1/slave/stop",{id:t._id},{withCredentials:!0}).then(function(){a.$refs.stop.disabled=!1}).catch(function(){a.$refs.stop.disabled=!1}))}}}},ZR0L:function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=s("vDqo"),n=s("4Llf"),i=s("VU/8"),r=i(a.a,n.a,!1,null,null,null);t.default=r.exports},mApI:function(e,t,s){"use strict";function a(e){s("wsqY")}Object.defineProperty(t,"__esModule",{value:!0});var n=s("PZmQ"),i=s("/prh"),r=s("VU/8"),o=a,c=r(n.a,i.a,!1,o,null,null);t.default=c.exports},vDqo:function(e,t,s){"use strict";var a=s("4xNv"),n=s("7+uW"),i=s("mApI");n.default.component("slave-custom-actions",i.default),t.a={name:"slave",data:function(){return{interval:{},apiMode:!0,apiUrl:"/api/v1/slave",httpOptions:{withCredentials:!0},sortFunctions:a.a.sortFunctions,onEachSide:1,tableFields:a.a.tableFields,itemsPerPage:[{value:10},{value:15},{value:20}]}},mounted:function(){var e=this;this.$nextTick(function(){e.interval=setInterval(function(){e.$refs.vuesticDataTable.$refs.vuetable.reload()},5e3)})},beforeDestroy:function(){clearInterval(this.interval)}}},wsqY:function(e,t,s){var a=s("L/3v");"string"==typeof a&&(a=[[e.i,a,""]]),a.locals&&(e.exports=a.locals);s("rjj0")("0f9808a5",a,!0)}});
//# sourceMappingURL=24.bb71765b258146244e44.js.map
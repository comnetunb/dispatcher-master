webpackJsonp([23,47],{"4var":function(e,t,i){"use strict";t.a={tableFields:[{name:"name",title:"name",sortField:"name"},{name:"startTime",title:"start time",sortField:"startTime",callback:"formatDate|DD/MM/YYYY, HH:mm:ss.SSS Z"},{name:"endTime",title:"end time",sortField:"endTime",callback:"formatDate|DD/MM/YYYY, HH:mm:ss.SSS Z"},{name:"__component:finished-custom-actions",title:"",dataClass:"text-center"}],sortFunctions:{name:function(e,t){return e>=t?1:-1}}}},En03:function(e,t,i){"use strict";function a(e){i("GFej")}Object.defineProperty(t,"__esModule",{value:!0});var n=i("yBYG"),s=i("HTzn"),r=i("VU/8"),o=a,l=r(n.a,s.a,!1,o,null,null);t.default=l.exports},GFej:function(e,t,i){var a=i("OaKp");"string"==typeof a&&(a=[[e.i,a,""]]),a.locals&&(e.exports=a.locals);i("rjj0")("c5c918fe",a,!0)},HTzn:function(e,t,i){"use strict";var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"btn-group"},[i("button",{ref:"view",staticClass:"btn btn-outline-primary btn-micro",on:{click:function(t){e.itemAction("view-item",e.rowData,e.rowIndex)}}},[i("i",{staticClass:"fa fa-search"})]),e._v(" "),i("button",{ref:"edit",staticClass:"btn btn-outline-info btn-micro",on:{click:function(t){e.itemAction("edit-item",e.rowData,e.rowIndex)}}},[i("i",{staticClass:"fa fa-edit"})]),e._v(" "),i("button",{ref:"delete",staticClass:"btn btn-outline-danger btn-micro",on:{click:function(t){e.itemAction("delete-item",e.rowData,e.rowIndex)}}},[i("i",{staticClass:"fa fa-remove"})])])},n=[],s={render:a,staticRenderFns:n};t.a=s},OaKp:function(e,t,i){t=e.exports=i("FZ+f")(!0),t.push([e.i,"","",{version:3,sources:[],names:[],mappings:"",file:"CustomActions.vue",sourceRoot:""}])},"c+oe":function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=i("gzrq"),n=i("pDx2"),s=i("VU/8"),r=s(a.a,n.a,!1,null,null,null);t.default=r.exports},gzrq:function(e,t,i){"use strict";var a=i("4var"),n=i("7+uW"),s=i("En03");n.default.component("finished-custom-actions",s.default),t.a={name:"finished",data:function(){return{interval:{},apiMode:!0,apiUrl:"/api/v1/taskset/finished",httpOptions:{withCredentials:!0},sortFunctions:a.a.sortFunctions,onEachSide:1,tableFields:a.a.tableFields,dataModeFilterableFields:["name"],itemsPerPage:[{value:10},{value:15},{value:20}]}},mounted:function(){var e=this;this.$nextTick(function(){e.interval=setInterval(function(){e.$refs.vuesticDataTable.$refs.vuetable.reload()},5e3)})},beforeDestroy:function(){clearInterval(this.interval)}}},pDx2:function(e,t,i){"use strict";var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("vuestic-widget",{attrs:{headerText:e.$t("menu.finished")}},[i("vuestic-data-table",{ref:"vuesticDataTable",attrs:{apiMode:e.apiMode,apiUrl:e.apiUrl,httpOptions:e.httpOptions,tableFields:e.tableFields,itemsPerPage:e.itemsPerPage,onEachSide:e.onEachSide,sortFunctions:e.sortFunctions,dataModeFilterableFields:e.dataModeFilterableFields}})],1)},n=[],s={render:a,staticRenderFns:n};t.a=s},yBYG:function(e,t,i){"use strict";var a=i("mtWM"),n=i.n(a);t.a={props:{rowData:{type:Object,required:!0},rowIndex:{type:Number}},methods:{itemAction:function(e,t,i){var a=this;"view-item"===e||"edit-item"===e||"delete-item"===e&&(this.$refs.delete.disabled=!0,n.a.post("/api/v1/taskset/delete",{id:t._id},{withCredentials:!0}).then(function(){a.$refs.delete.disabled=!1,a.$parent.reload()}).catch(function(){a.$refs.delete.disabled=!1}))}}}}});
//# sourceMappingURL=23.26f48fb9cee0d897e90f.js.map
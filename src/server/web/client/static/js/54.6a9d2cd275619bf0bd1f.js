webpackJsonp([54],{"8dP5":function(e,t,a){"use strict";t.a={tableFields:[{name:"level",title:"",callback:"getEquivalentLogLevel"},{name:"date",title:"date",sortField:"date",callback:"formatDate|DD/MM/YYYY, HH:mm:ss.SSS Z"},{name:"log",title:"log"}],sortFunctions:{name:function(e,t){return e>=t?1:-1}}}},PBs6:function(e,t,a){"use strict";var n=a("8dP5");t.a={name:"log",data:function(){return{interval:{},apiMode:!0,apiUrl:"/api/v1/sys-log",httpOptions:{withCredentials:!0},sortFunctions:n.a.sortFunctions,onEachSide:1,tableFields:n.a.tableFields,itemsPerPage:[{value:10},{value:15},{value:20}]}},mounted:function(){var e=this;this.$nextTick(function(){e.interval=setInterval(function(){e.$refs.vuesticDataTable.$refs.vuetable.reload()},5e3)})},beforeDestroy:function(){clearInterval(this.interval)}}},phGx:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=a("PBs6"),i=a("ucm7"),s=a("VU/8"),l=s(n.a,i.a,!1,null,null,null);t.default=l.exports},ucm7:function(e,t,a){"use strict";var n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("vuestic-widget",{attrs:{headerText:e.$t("menu.logs")}},[a("vuestic-data-table",{ref:"vuesticDataTable",attrs:{apiMode:e.apiMode,itemsPerPage:e.itemsPerPage,onEachSide:e.onEachSide,sortFunctions:e.sortFunctions,apiUrl:e.apiUrl,httpOptions:e.httpOptions,tableFields:e.tableFields}})],1)},i=[],s={render:n,staticRenderFns:i};t.a=s}});
//# sourceMappingURL=54.6a9d2cd275619bf0bd1f.js.map
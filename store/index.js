import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		forcedLogin: 1, // 强制登录 是1  否0 
		hasLogin: false,
		userInfo: {}, 
		baseUrl:"http://",
		addCarInfo:{}, // 一单多车时，追加车辆时一整条子表数据
		selectItem:{} , // 模糊搜索事件选择的数据
		SOBinfos:[] , // 厂区选择
		isSOB : 0 , // 是否启用厂区
	},
	mutations: {
		// 保存追加车辆时的子表对象
		addCarReduce(state, provider) {
			console.log(JSON.stringify(provider));
			state.addCarInfo = provider;
		},
		// 模糊搜索事件
		
		// 执行模糊查询后的选中事件
		selectReduce(state, provider) {
			// console.log(JSON.stringify(provider));
			state.selectItem = provider;
		},
		// 执行是否更新 列表中的选择状态
		reachCheckReduce(state,data){
			
		},
		setSOBinfoReduce(state,data){
			// console.log(JSON.stringify(data));
			state.SOBinfos = data;
		},
		setIsSOBReduce(state,data){
			// console.log(JSON.stringify(data));
			state.isSOB = data;
		},
		
	},
	actions: {
		
	},
	modules:{
		
	}
})

export default store

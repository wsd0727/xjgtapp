<template>
	<view class="search-wrapper">

		<view class="cu-bar search bg-white">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input v-model="keyword" class="text-m" @input="inputKey" :adjust-position="false" type="text" placeholder="请输入2个及以上关键字查询"
				 confirm-type="search"></input>
			</view>
			<view class="action" @click="handleSearch">
				<button class="cu-btn bg-green shadow-blur round">搜索</button>
			</view>
		</view>
		<!-- <view class="section uni-flex">
			<view class="input-search">
				<input @input="inputKey"  placeholder="请输入关键字"  style="border: 1px solid #AAAAAA;padding: 2px 6px;border-radius: 4px;"/>
			</view>
			<view class="btn-search">
					<uni-icon size="30" type="search"  @click="switchActive(index)"></uni-icon>				
			</view>
		</view> -->
		<view class="search-list">
			<view class="list-item flex-sb text-black text-m" v-for="(item,index) in listData" :key="index" @click="selectData(item)">
				<view class="text-m">
					{{ item.FullName || item.VNAME }}
				</view>
				<view class="text-m" v-if="item.DRID">
					{{ item.DRID }}
				</view>
			</view>
		</view>
	</view>


</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	// import api from '../../common/api.js'
	// import uniIcon from '../../components/uni-icon.vue'
	import util from '../../common/util.js'
	let _self, searchUrl, urlParams, token;
	let webView;
	export default {
		data() {
			return {
				baseUrl: '',
				type: '',
				userId: '',
				keyword: '',
				listData: [],
				Title: undefined,
				TipBtn: false,
				Config: {}
			};
		},
		/* components: {
				uniIcon
		}, */

		onLoad: function(params) {
			_self = this;
			this.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				let params = JSON.stringify(data);
				// myToken   = data.myToken || ''
				urlParams = data.requestData // util.getUrlParamteter(data.url)
				searchUrl = data.url
				uni.getStorage({
					key:'baseUrl',
					success:function(res){
						_self.baseUrl = res.data
					}
				})
				uni.getStorage({
					key: 'token',
					success: function(res) {
						token = res.data;
						_self.requestList('')
					}
				});
				// 判断是否展示 plus 
				_self.Title = data.title;
				_self.set_PLUSBtn()
				uni.setNavigationBarTitle({
					title: data.title
				});
			});
			uni.getStorage({
				key: 'userId',
				success: function(res) {
					_self.userId = res.data
				}
			});
			uni.getStorage({
				key: 'allCFG',
				success: (res) => {
					let data = JSON.parse(res.data).homeCFG;
					_self.Config = data;
				}
			})
		},
		onShow: function() {},
		methods: {
			...mapMutations(['selectReduce']), // 引入 store 中的reduce方法
			inputKey: function(e) {
				let val = e.detail.value;
				if (val.length > 1) {
					this.requestList(val)
				}
			},
			handleSearch() {
				_self.requestList(_self.keyword)
				// console.log(_self.keyword);
			},
			selectData: function(e) {
				console.log(JSON.stringify(e))
				uni.$emit('getSelectItem', { ...e
				});
				// _self.selectReduce(e);
				this.uniSkip.navigateBack({});
			},
			requestList: function(e) {
				// console.log(new Date().toLocaleString());
				let requestData = {
					...urlParams,
					VNAME: e,
					PageInfo: {
						page: 1,
						rows: 100,
						sidex: "BILLNO",
						sord: "DESC"
					}
				}
				// console.log(requestData)	
				// console.log(searchUrl)
				let params = {
					method: 'POST',
					url: searchUrl,
					data: requestData,
					token: token,
					isLoading: true
				}
				_self.$axios(params)
					.then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						_self.listData = Result.rows
					})

				// console.log(JSON.stringify(requestData));
				// console.log(searchUrl);
				// console.log(token)
				// uni.request({
				// 	url: searchUrl,
				// 	method:"POST",
				// 	header: { Authorization:'BasicAuth '+token },
				// 	data: requestData ,
				// 	success:function(res) {
				// 		console.log(JSON.stringify(res))
				// 		// console.log(new Date().toLocaleString());
				// 		if(res.statusCode != 200){
				// 			uni.showToast({
				// 				title: '请求失败！',
				// 				icon: 'none',
				// 				duration: 2000
				// 			});
				// 			return;
				// 		}else if( res.statusCode == 401 ){
				// 			return uni.navigateTo({
				// 				url:'../tab05/login'
				// 			})
				// 		}

				// 		if(res.data.IsSuccess){
				// 			_self.listData = res.data.Result.rows
				// 		}else{
				// 			uni.showToast({
				// 				title: '未查询到数据',
				// 				icon: 'none',
				// 				duration: 1000
				// 			});
				// 		}
				// 	}
				// })	
			},
			// 关键字匹配
			set_PLUSBtn() {
				// #ifdef APP-PLUS
				webView = this.$mp.page.$getAppWebview();
				let Title = this.Title;
				if (Title.indexOf("司机") > 0 || Title.indexOf("车辆") > 0 || Title.indexOf("车号") > 0) {
					this.TipBtn = true;
					webView.setTitleNViewButtonStyle(0, {
						width: 30,
					});
					let TYPE = Title.indexOf("司机") > -1 ? 'Drive' : 'Car';
					// this.setGloaddata(TYPE)
				} else {
					this.TipBtn = false;
					webView.setTitleNViewButtonStyle(0, {
						width: 0,
					});
				}
				// #endif
			}
		},
		onNavigationBarButtonTap(Obj) {
			// #ifdef APP-PLUS
			if (this.TipBtn) {
				if (Obj.index == 0) {
					let Title = this.Title;
					let title = Title.indexOf("司机") > -1 ? '司机' : '车辆',
						config = this.Config.find(el => el.FUNCTIONNAME == title)
					_self.uniSkip.navigateTo({
						url: `/pages/tab03/submit?Back=1&userId=${_self.userId}&baseUrl=${_self.baseUrl}`,
						data: {...config, token}
					})
				}
			}
			// #endif
		},
	}
</script>

<style scoped>
	.search-wrapper {}

	.search-list {
		background-color: #FFFFFF;
		margin-top: 20upx;
	}

	.list-item {
		padding: 20upx;
		border-bottom: 1px solid #DBDBDB;
		display: flex;
		justify-content: space-between;
	}

	.list-item:active {
		background-color: #ededed;
	}
</style>

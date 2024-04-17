<template name="sendcar">
	<!-- 报表和订单  列表界面 -->
	<view class="mypage">
		<view class="fixed-col-wrap bg-white shadow" v-if="staticColConfig.length>0">
			<view class="fixed-col-title solid-bottom fixed-top">
				<view class="fixed-col-title-name text-center text-m" :style="{width:item.COLUMNWEIGHT+'%'}"
					v-for="item in staticColConfig">
					{{ item.DISPLAYNAME }}
				</view>
			</view>
			<view class="" style="height: 4vh;">
			</view>
			<view class="fixed-col-title fixed-col-data "  v-for="(itemdata,indexD) in staticData" >
				<view class="fixed-col-title-name text-center text-m" :style="{width:item.COLUMNWEIGHT+'%'}"
					v-for="item in staticColConfig">
					{{ itemdata[item.FIELDNAME] }}
				</view>
			</view>
		</view>



		<!-- 订单审核 审批等操作 -->
		<view class="card-list-wrapper" :style="{marginTop:marginTop}">
			<!-- @click="openDetail(item)" -->
			<view class="card-list-row radius shadow-warp bg-white margin-top" v-for="(item,index) in orderList"
				:key="index" @click="openDetailT(item)">
				<view class="card-list-row-1" v-for="(itemC,indexC) in listCFG" v-if="itemC.ISVISIBLE==1">
					<!-- <text class="cuIcon-title" :class="'text-'+ColorList[indexC].name"></text> -->
					<text class="text-grey  text-m">{{ itemC.DISPLAYNAME }}： </text>
					<text class="text-black text-m"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
				</view>

				<view class="cu-capsule radius num-tag position-a">
					<view class='cu-tag bg-blue sm'>
						<text class='cuIcon-medal'></text>
					</view>
					<view class="cu-tag line-brown sm">
						{{ index+1}}
					</view>
				</view>
				<!-- 列表底部操作区域 v-if="checkInUrl[TabCur]" v-if="checkInUrl[TabCur]"-->
				<view class="solid-top-gray handel-btn-area" v-if="isHandle">
					<view class="">
						<button class="cu-btn round lines-blue"
							@click.stop="openDetail(item,2)">{{ approvalBtnName }}</button>
					</view>

					<view class="">
						<button class="cu-btn round lines-blue" @click.stop="openDetailT(item)">{{ '详情' }}</button>
					</view>
				</view>

			</view>

			<view class="height50"></view>
		</view>


		<view class="nodata-icon-wrap text-grey" v-if="orderList.length<1">
			<text class="cuIcon-warn"></text>
			<view>暂无数据</view>
		</view>
	</view>

</template>

<script>
	import utils from '@/common/util.js'
	import api from '@/common/api.js'
	let _self, baseUrl, myToken, voluationJson, userId, token,
		queryUrl, detailUrl, submitUrl, reviewUrl, approvalUrl,
		reviewBtnName, pageTitle, ModuleType, Code,
		page = 1,
		total = 1,
		detailCFG;

	let queryParams = {
		userId: '',
		PageInfo: {
			page: 1,
			rows: 10,
			sidx: "BILLNO",
			sord: "DESC"
		}
	}
	export default {
		data() {
			return {
				orderList: [],
				ColorList: this.ColorList,
				paddingTop: 0,
				startType: 2,
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				TabCur: 0, // 当前激活项
				scrollLeft: 0,
				CustomBar: this.CustomBar,
				modalName: null,

				tabList: [],
				listCFG: [],
				dateTimekey: '',
				approvalBtnName: '', // 审核或审批按钮名称
				isHandle: false, // 是否开启底部操作
				approvalType: '', // 审批类型
				staticColConfig: [], // 静态配置
				staticData: [], // 静态的固定列表数据
				marginTop: '',
			};
		},
		components: {},

		onLoad(params) {
			_self = this
			userId = params.userId;
			baseUrl = params.baseUrl;
			// console.log(params);
			_self.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				page = 1, total = 1
				// console.log(data.token );
				token = data.token
				_self.listCFG = data.DYNAMICMODEL.List
				detailCFG = data.DYNAMICMODEL.Detail
				_self.staticColConfig = data.DYNAMICMODEL.ListTotal
				pageTitle = data.MODULEIDNAME
				queryParams = {
					...queryParams,
					...data.condition
				};
				console.log(data.CHILDRENS);
				data.CHILDRENS.forEach((item) => {
					if (data.CHILDRENS.length == 1) {
						detailUrl = false;
					}
					if (item.ISFUNCTION == 2) {
						queryUrl = item.INTERFACEURL;
					} else if (item.ISFUNCTION == 4) {
						detailUrl = baseUrl + item.INTERFACEURL;
					} else if (item.ISFUNCTION == 7) { // 审核 和审批 只存在一个
						approvalUrl = baseUrl + item.INTERFACEURL;
						_self.approvalBtnName = item.FUNCTIONNAME
						_self.isHandle = true // 是否开启操作
						_self.approvalType = item.CONFIGMODEL[0].VALUE; // 0 审核 1 审批
						// console.log(_self.approvalType);
					}

				})
				_self.listCFG.forEach(item => {
					if (item.FIELDNAME == 'Code') {
						Code = item.DEFAULTVALUE
					} else if (item.FIELDNAME == 'ModuleType') {
						ModuleType = item.DEFAULTVALUE
					}
				})
				// console.log(queryUrl,detailUrl);
				uni.setNavigationBarTitle({
					title: pageTitle
				});
				_self.getNewsList();
			})
			// 初始化页面加载动态配置
			// _self.initGetStorage()
		},

		onNavigationBarButtonTap(type) {
			// console.log(type);
			if (type.index == 0) {
				_self.showModal('DrawerModalL')
			}
			// _self.showModal('DrawerModalL')
		},
		//下拉刷新
		onPullDownRefresh: function() {
			// 重置分页及数据
			// page = 1;
			_self.artList = [];
			_self.orderList = [];
			page = 1;
			total = 1;
			this.getNewsList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
			uni.showToast({
				"title": "数据已刷新",
				icon: "none"
			});
		},
		// 加载更多
		onReachBottom: function() {
			if (_self.sendCarType == 3) {
				// console.log('无单派车,不加载数据');
				return null;
			}
			this.getNewsList();
		},
		methods: {
			showModal(e) {
				this.modalName = e
			},
			hideModal(e) {
				this.modalName = null
			},
			dateEvent(e) {
				_self.dateTimekey = e.FIELDNAME;
				this.$refs.dateTime.show();
			},

			setFormat(a, b, c) {
				return utils.setFormat(a, b, c);
			},
			// 直接打开详情
			openDetailT(e) {
				if (!detailUrl) {
					return;
				}
				_self.uniSkip.navigateTo({
					url: 'detail?baseUrl=' + detailUrl + '&userId=' + userId + '&title=' + pageTitle,
					data: {
						config: detailCFG,
						items: e,
						token: token,
						reviewBtnName: reviewBtnName
					}
				})
			},
			openDetail: function(e, t) {
				if (!detailUrl || !_self.isHandle) {
					return null;
				}

				if (_self.approvalType == 0) { // 审核提交
					_self.reviewSubmit(approvalUrl, e)
				} else if (_self.approvalType == 1) {
					//  进入审批流
					// console.log(e);
					let url = baseUrl + api.apiPublic.getApproval01;
					if (e.BILLSTATUS != 5) {
						return _self.approvalSubmit(url, e);
					} else {
						return _self.uniSkip.navigateTo({
							url: 'approval?baseUrl=' + approvalUrl + '&userId=' + userId + '&title=' +
								pageTitle,
							data: {
								config: detailCFG,
								listConfig: _self.listCFG,
								items: e,
								token: token,
								baseUrl: baseUrl,
								Code: Code,
								ModuleType: ModuleType
							}
						})
					}


				}

			},

			getNewsList() {
				if (page > total) {
					return uni.showToast({
						title: '没有数据了',
						icon: 'none',
						duration: 1000
					})
				}
				// utils.tips('加载中...')
				queryParams.userId = userId;
				queryParams.PageInfo.page = page;
				console.log(queryParams);
				// console.log(baseUrl + queryUrl);
				this.$axios({
					url: baseUrl + queryUrl,
					data: queryParams,
					token: token,
					isLoading: true
				}).then(res => {
					let {
						Result
					} = res;
					if (page == 1) {
						_self.orderList = Result.rows
						_self.staticData = Result.ReportTotal || []
						if(_self.staticColConfig){
							if(( _self.staticData.length + 2 ) > 12 ){
								_self.marginTop = _self.staticColConfig ? 13 * 4 + 'vh' : '';
							}else{
								_self.marginTop = _self.staticColConfig ? (_self.staticData.length + 2) * 4 + 'vh' : '';
							}
						}
						// _self.marginTop = _self.staticColConfig ? (_self.staticData.length + 2) * 4 + 'vh' : '';
					} else {
						_self.orderList = _self.orderList.concat(Result.rows);
					}
					total = Result.total || 1;
					page = page + 1;
				})
			},

			reviewSubmit(url, data) { // 审核提交
				// console.log(data);
				// console.log(url);
				uni.showLoading({
					title: '加载中...'
				})
				uni.request({
					url: url,
					data: data,
					method: "POST",
					header: {
						Authorization: 'BasicAuth ' + token
					},
					success: function(res) {
						console.log(res);
						uni.hideLoading();
						if (res.data.IsSuccess && res.statusCode == 200) {
							uni.showToast({
								title: res.data.Message,
								icon: 'none',
								duration: 1500
							});
						} else {
							uni.showToast({
								title: '失败:' + res.data.Message,
								icon: 'none',
								duration: 2000
							});
						}
					},
					error: function(error) {
						uni.hideLoading();
						uni.showToast({
							title: '失败:' + res.data.Message,
							icon: 'none',
							duration: 2000
						});
					}
				})
			},
			approvalSubmit(url, e) { // 审核提交
				uni.showLoading({
					title: '加载中...'
				})
				// console.log(url);
				// console.log({Code: Code, ModuleType:ModuleType,BILLNO:e.BILLNO  });
				uni.request({
					url: url,
					data: {
						Code: Code,
						ModuleType: ModuleType,
						BILLNO: e.BILLNO
					},
					method: "POST",
					header: {
						Authorization: 'BasicAuth ' + token
					},
					success: function(res) {
						console.log(res);
						uni.hideLoading();
						if (res.data.IsSuccess && res.statusCode == 200) {
							return _self.uniSkip.navigateTo({
								url: 'approval?baseUrl=' + approvalUrl + '&userId=' + userId,
								data: {
									config: detailCFG,
									listConfig: _self.listCFG,
									items: e,
									token: token,
									baseUrl: baseUrl,
									Code: Code,
									ModuleType: ModuleType
								}
							})
						} else {
							uni.showToast({
								title: '失败:' + res.data.Message,
								icon: 'none',
								duration: 3000
							});
						}
					},
					error: function(error) {
						uni.hideLoading();
						utils.tips('失败:网络请求错误')
						// uni.showToast({
						// 	title: '失败:网络请求错误' ,
						// 	icon: 'none',
						// 	duration: 2000
						// });
					}
				})
			},
		}
	}
</script>

<style>
	.height50 {
		height: 50px;
	}

	.card-list-wrapper {
		width: 710upx;
		height: 100upx;
		margin: 0 auto;
	}

	.card-list-row {
		padding: 20upx;
	}

	.card-list-row-1 {
		padding: 10upx 0;
	}

	.cu-form-group {
		display: flex;
		justify-content: space-between;
	}

	.cu-form-group .cu-form-val {
		height: 60upx;
		line-height: 60upx;
	}

	.cu-form-group .cu-form-input input {
		width: 50vw;
		text-align: right;
	}

	.fixed-col-wrap {
		width: 750rpx;
		padding: 10rpx;
		position: fixed;
		top: 0;
		z-index: 9;
		max-height: 50vh;
		overflow: auto;
	}

	.fixed-col-title {
		height: 4vh;
		align-items: center;
		display: flex;
		justify-content: flex-start;
	}

	.fixed-col-data .fixed-col-title-name:last-child {
		color: red;
	}
	.fixed-top{
		width: 100%;
		position: fixed;
		top: 0;
		z-index: 10;
		background-color: #fff;
	}
	.fixed-data{
		width: 100%;
		position: fixed;
		top: 4vh;
		background-color: #fff;
		color: blueviolet;
	}
</style>

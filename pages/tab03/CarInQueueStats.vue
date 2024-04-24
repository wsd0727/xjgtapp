<template>
	<view>
		<view class="queueList content">
			<view class="">
				<!-- <view class="queueList-backImg">
					<view class="queueList-smallTitle" v-if="objData.OrderCount">当前序号</view>
					<view class="queueList-queueNo" v-if="objData.OrderCount">{{objData.OrderCount}}</view>
					<view class="queueList-statusText">{{objData.ORDERSTATUSNAME}}</view>
					<view class="queueList-rank">当前排队车辆数{{objData.TotalCount}}</view>
					<view class="p20">
						<view class="disflex mb-10 mt-40">
							<view class="queueList-label">车牌号：</view>
							<view class="queueList-value">{{objData.CARSNAME}}</view>
						</view>
						<view class="disflex mb-10 mt-40">
							<view class="queueList-label">物料：</view>
							<view class="queueList-value">{{objData.MATERIALNAME}}</view>
						</view>
						<view class="disflex mb-10">
							<view class="queueList-label">物料规格：</view>
							<view class="queueList-value">{{objData.MATSPEC}}</view>
						</view>
						<view class="disflex">
							<view class="queueList-label">叫号次数：</view>
							<view class="queueList-value">{{objData.VCOUNT}}</view>
						</view>
					</view>
					<view class="queueList-time">签到时间：{{objData.ORDERTIME}}</view>
					<view class="queueList-time">叫号时间：{{objData.CALLTIME}}</view>

				</view> -->
				<view class="content-item">
					<!-- <view class="queueList-CARNAME">{{item.CARNAME}}</view> -->
					<!-- <view class="disflex justify-sb" v-if="isTSLY"> -->
					<view class="disflex justify-sb mb-20">

						<view class="disflex">
							<view class="queueList-num">{{objData.VINDEX}}</view>
							<view class="queueList-carNo">{{objData.CARSNAME}}</view>
						</view>
						<view class="queueList-status">
							{{objData.ORDERSTATUSNAME}}
						</view>
					</view>
					<view class="disflex justify-sb">
						<view>
							<view class="disflex mb-10">
								<view class="queueList-label">当前序号：</view>
								<view class="queueList-value">{{objData.OrderCount}}</view>
							</view>
							<view class="disflex mb-10">
								<view class="queueList-label">当前排队车辆数：</view>
								<view class="queueList-value">{{objData.TotalCount}}</view>
							</view>
							<view class="disflex mb-10">
								<view class="queueList-label">物料：</view>
								<view class="queueList-value">{{objData.MATERIALNAME}}</view>
							</view>
							<view class="disflex">
								<view class="queueList-label">物料规格：</view>
								<view class="queueList-value">{{objData.MATSPEC}}</view>
							</view>
							<view class="disflex">
								<view class="queueList-label">叫号次数：</view>
								<view class="queueList-value">{{objData.VCOUNT}}</view>
							</view>
						</view>
						<view>
						</view>
					</view>
					<view class="queueList-time">签到时间：{{objData.ORDERTIME}}</view>
					<view class="queueList-time" v-if="objData.CALLTIME">叫号时间：{{objData.CALLTIME}}</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	let _self, baseUrl, myToken, voluationJson, userId, token,
		queryUrl, detailUrl, submitUrl, signingUrl, invalidUrl, checkInUrl, closeURL, auditURL,
		page = 1,
		total = 1,
		pageTitle,
		initQueryJson = '',
		queryParams22 = {},
		isMS = false,
		detailCFG, submitCFG;
	export default {
		data() {
			return {
				objData: {},
				Phone: ''
			}
		},
		onLoad(params) {
			_self = this
			userId = params.userId;
			baseUrl = params.baseUrl;

			_self.uniSkip.getParams(function(data) {
				token = data.token
				uni.getStorage({
					key: 'userInfo',
					success: function(res) {
						const userData = JSON.parse(res.data)
						_self.Phone = userData.Mobile || '';
						_self.getNewsList()
					}
				});
			})
		},
		methods: {
			getNewsList() {
				console.log(_self.Phone);
				setTimeout(function() {
					uni.hideLoading();
				}, 5000);
				_self.$axios({
						url: baseUrl + '/api/ParkQueue/CarInQueueStats',
						data: {
							Phone: _self.Phone,

						},
						token: token,
						isLoading: true
					})
					.then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						console.log(res)
						// console.log(_self.planList);
						// console.log(res.Result);
						this.objData = res.Result
						// if (page == 1) {
						// 	_self.planList = Result
						// } else {
						// 	_self.planList = _self.planList.concat(Result);
						// }
						// console.log(_self.planList);
						// total = Result.total || 1;
						// page = page + 1;
					})
			},

		}
	}
</script>


<style lang="scss" scoped>
	.p-10 {
		padding: 10rpx 0;
	}

	.disflex {
		display: flex;
		align-items: center;
	}

	.justify-sb {
		justify-content: space-between;
	}

	.mb-10 {
		margin-bottom: 10rpx;
	}

	.mb-20 {
		margin-bottom: 20rpx;
	}

	.content {
		padding: 0 16rpx;

		&-item {
			background-color: #fff;
			margin-bottom: 10rpx;
			border-radius: 12rpx;
			padding: 24rpx 30rpx;

			&-row {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;
			}
		}
	}

	// .queueList {

	// 	font-size: 24rpx;
	// 	font-weight: 400;
	// 	color: #535353;

	// 	background-color: #EBEBEB;
	// 	min-height: calc(100vh - 90rpx);

	// 	padding-top: 20rpx;

	// 	&-backImg {
	// 		// background: url("/static/list/queueInfo.png") no-repeat center center;
	// 		background: url("/static/list/queueInfo.png") no-repeat center center;
	// 		background-size: cover;

	// 		padding: 50rpx 20rpx 20rpx 20rpx;
	// 	}

	// 	&-smallTitle {
	// 		font-size: 28rpx;
	// 		font-weight: 500;
	// 		color: #191919;
	// 		text-align: center;
	// 		margin-bottom: 20rpx;
	// 	}

	// 	&-queueNo {
	// 		font-size: 48rpx;
	// 		font-weight: bold;
	// 		color: #131313;
	// 		text-align: center;
	// 		margin-bottom: 50rpx;
	// 	}

	// 	&-statusImg {
	// 		width: 41rpx;
	// 	}

	// 	&-statusText {
	// 		font-size: 22rpx;
	// 		font-weight: 500;
	// 		color: #161616;
	// 		margin-top: 20rpx;

	// 		// &.active {
	// 		// 	color: #161616;
	// 		// }
	// 	}

	// 	&-rowLine {
	// 		width: 100rpx;
	// 		height: 2rpx;
	// 		border-top: 1rpx dashed #c0c0c0;
	// 	}

	// 	&-ranking {

	// 		background: #F0F0F0;
	// 		border-radius: 28rpx;
	// 		padding: 12rpx 40rpx;
	// 		max-width: 200rpx;
	// 		margin: 50rpx auto;
	// 	}

	// 	&-rank {
	// 		font-size: 24rpx;
	// 		font-weight: 400;
	// 		color: #7B7B7B;
	// 		text-align: center;
	// 		margin-bottom: 100rpx;
	// 		margin-top: 100rpx;
	// 	}


	// 	// &-CARNAME {
	// 	// 	// font-size: 23rpx;
	// 	// 	// font-weight: bold;
	// 	// 	// color: #2C76FF;
	// 	// 	margin-bottom: 20rpx;
	// 	// 	font-size: 26rpx;
	// 	// 	font-weight: bold;
	// 	// 	color: #131313;

	// 	// }

	// 	// &-status {
	// 	// 	font-size: 28rpx;
	// 	// 	font-weight: bold;
	// 	// 	// color: #2C76FF;
	// 	// }

	// 	// &-num {
	// 	// 	width: 27rpx;
	// 	// 	height: 27rpx;
	// 	// 	background: #297BFC;
	// 	// 	border-radius: 4rpx;
	// 	// 	font-size: 22rpx;
	// 	// 	font-weight: 500;
	// 	// 	color: #FFFFFF;
	// 	// 	text-align: center;
	// 	// 	line-height: 27rpx;
	// 	// 	margin-right: 10rpx;
	// 	// }


	// 	// &-carNo {
	// 	// 	font-size: 28rpx;
	// 	// 	font-weight: bold;
	// 	// 	color: #131313;


	// 	// }


	// 	&-label {
	// 		color: #636363;
	// 		font-size: 26rpx;
	// 		width: 140rpx;
	// 	}

	// 	&-value {
	// 		color: #191919;
	// 		font-size: 26rpx;
	// 	}

	// 	&-time {
	// 		border-top: 1rpx solid #CFCFCF;
	// 		// padding-top: 20rpx;
	// 		padding: 20rpx;
	// 		// margin-top: 20rpx;
	// 		margin: 20rpx;

	// 	}



	// }
	.queueList {
		// background-color: #fff;
		padding: 20rpx;
		font-size: 24rpx;
		font-weight: 400;
		color: #535353;



		&-CARNAME {
			// font-size: 23rpx;
			// font-weight: bold;
			// color: #2C76FF;
			margin-bottom: 20rpx;
			font-size: 26rpx;
			font-weight: bold;
			color: #131313;

		}

		&-status {
			font-size: 28rpx;
			font-weight: bold;
			// color: #2C76FF;
		}

		&-num {
			width: 27rpx;
			height: 27rpx;
			background: #297BFC;
			border-radius: 4rpx;
			font-size: 22rpx;
			font-weight: 500;
			color: #FFFFFF;
			text-align: center;
			line-height: 27rpx;
			margin-right: 10rpx;
		}


		&-carNo {
			font-size: 28rpx;
			font-weight: bold;
			color: #131313;


		}


		&-label {
			color: #636363;
			font-size: 26rpx;
			width: 140rpx;
		}

		&-value {
			color: #191919;
			font-size: 26rpx;
		}

		&-time {
			border-top: 1rpx solid #CFCFCF;
			padding-top: 20rpx;
			margin-top: 20rpx;
		}

		&-statusImg {
			width: 56rpx;
		}


	}
</style>
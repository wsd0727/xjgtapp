<template>
	<view class="queueList content">
		<template>
			<view class="content-item" v-for="(item,index) in planList" :key="item.BILLNO">
				<!-- <view class="queueList-CARNAME">{{item.CARNAME}}</view> -->
				<!-- <view class="disflex justify-sb" v-if="isTSLY"> -->
				<view class="disflex justify-sb mb-20">

					<view class="disflex">
						<view class="queueList-num">{{item.VINDEX}}</view>
						<view class="queueList-carNo">{{item.CARSNAME}}</view>
					</view>
					<view class="queueList-status">
						{{item.ORDERSTATUSNAME}}
					</view>
				</view>

				<view class="disflex justify-sb">
					<view>
						<view class="disflex mb-10">
							<view class="queueList-label">物料：</view>
							<view class="queueList-value">{{item.MATERIALNAME}}</view>
						</view>
						<view class="disflex">
							<view class="queueList-label">物料规格：</view>
							<view class="queueList-value">{{item.MATSPEC}}</view>
						</view>
						<view class="disflex">
							<view class="queueList-label">叫号次数：</view>
							<view class="queueList-value">{{item.VCOUNT}}</view>
						</view>
					</view>
					<view>
						<!-- <image v-if="item.vtype == 1" src="../../../static/list/status2.png" mode="widthFix" class="queueList-statusImg">
					</image>
					<image v-else-if="item.vtype == 2" src="../../../static/list/status4.png" mode="widthFix" class="queueList-statusImg">
					</image>
					<image v-else-if="item.vtype == 3" src="../../../static/list/status5.png" mode="widthFix" class="queueList-statusImg">
					</image> -->
					</view>
				</view>
				<view class="queueList-time">签到时间：{{item.ORDERTIME}}</view>
				<view class="queueList-time" v-if="item.CALLTIME">叫号时间：{{item.CALLTIME}}</view>
			</view>
			<view class="nodata-icon-wrap text-grey" v-if="planList.length<1">
				<text class="cuIcon-warn"></text>
				<view>暂无数据</view>
			</view>
		</template>
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
				planList: [],
				Phone: ''
			}
		},
		onLoad(params) {
			console.log(params);
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
				// console.log(pageList[i],totalList[i]);
				console.log(page);
				console.log(total);
				// if (page > total) {
				// 	return uni.showToast({
				// 		title: '没有数据了',
				// 		icon: 'none',
				// 		duration: 1000
				// 	})
				// }
				setTimeout(function() {
					uni.hideLoading();
				}, 5000);

				// console.log(JSON.stringify(queryParams22));
				// console.log(baseUrl + queryUrl);
				_self.$axios({
						url: baseUrl + '/api/ParkQueue/CarInQueue',
						data: {
							Phone: _self.Phone
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
						if (page == 1) {
							_self.planList = Result
						} else {
							_self.planList = _self.planList.concat(Result);
						}
						console.log(_self.planList);
						total = Result.total || 1;
						page = page + 1;
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
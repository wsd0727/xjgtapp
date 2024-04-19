<template>
	<view class="railwayImg">
		<image @click="clickImage(index)" v-for="(item,index) in newImgList" :key="index" :src="item"
			mode="widthFix" style="width: 100%;margin-bottom: 10rpx;"></image>
	</view>
</template>

<script>
	let _self, baseUrl, PK_MATERIAL, token;
	export default {
		data() {
			return {
				dataList: [],
				newImgList:[]
			}
		},
		onLoad(params) {
			_self = this
			PK_MATERIAL = params.PK_MATERIAL;
			baseUrl = params.baseUrl;
			token = params.myToken
			_self.getData()
		},
		methods: {
			clickImage(index) {
				uni.previewImage({
					current:index,
					urls: _self.newImgList,
					longPressActions: {
						// itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				});
			},
			getData() {
				_self.$axios({
						url: baseUrl + '/api/AppBDPLANTROUTEMAP/CommonPost?operateType=GetListByMaterId',
						data: {
							PK_MATERIAL: PK_MATERIAL
						},
						token: token,
						isLoading: true
					})
					.then(res => {
						console.log(res);
						_self.dataList = res.Result
						_self.newImgList = _self.dataList.map(ele=>baseUrl+ele.MAPURL)
						console.log(_self.newImgList);
					})
			}
		}
	}
</script>

<style>
	.railwayImg {
		padding: 16rpx;
		background-color: #fff;
	}
</style>
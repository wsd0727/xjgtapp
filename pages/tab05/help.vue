<template>
	<view class="">
		<view class="about-main">
			<view class="c-333">
				售后服务电话
			</view>
			<view class="help-phone" @click="handlePhone">
				<text class="cuIcon-service" style="font-size: 40upx;"></text>
				<text class="phone-text">{{ phone }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	let _self;
	export default {
		data(){
			return{
				phone:''
			}
		},
		onLoad() {
			_self = this
			this.phone = getApp().globalData.phone
		},
		methods: {
			handlePhone() {
				uni.makePhoneCall({
					phoneNumber: _self.phone //仅为示例
				});
			}
		},
	}
</script>

<style scoped="">
	.about-main {
		padding: 400upx 20upx 0 20upx;
		text-align: center;
	}

	.phone-icon {
		font-size: 60upx;
		position: relative;
		top: 10upx;
	}

	.phone-text {
		font-size: 40upx;
		font-weight: 600;
		margin-left: 20upx;
	}

	.help-phone {
		color: #0164FF;
		line-height: 100upx;
		margin-top: 60upx;
	}
</style>

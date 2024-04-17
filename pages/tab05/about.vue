<template>
	<view class="">
		<view class="about-main">
			<view class="about-logo">
				<!-- <image src="../../static/logo-s.png" mode=""></image> -->
			</view>
			<view class="about-desc">
				{{ aboutUs }}
			</view>
		</view>
		
		<view class="text-gray uuid">
			{{ PHONEMAC }}
		</view>
		
	</view>
</template>

<script>
	let _self;
	export default {
		data(){
			return{
				aboutUs:'' ,
				PHONEMAC:''
			}
		},
		onLoad() {
			this.aboutUs = getApp().globalData.aboutUS 
			this.PHONEMAC = plus.device.imei || plus.device.imsi 
			console.log(this.PHONEMAC);
		}
	}
</script>

<style scoped="">
	.about-main {
		padding: 200upx 20upx;
	}
	.about-logo image {
		width: 100upx;
		height: 100upx;
		margin-left: 320upx;
		margin-bottom: 100upx;
	}
	.about-desc {
		text-indent: 1.5rem;
	}
	
	.uuid{
		position: fixed;
		bottom: 20rpx;
		left: 50%;
		font-size: 20rpx;
		transform: translateX(-50%);
	}
</style>

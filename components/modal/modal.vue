<template>
	<!-- 公告类的弹出框 -->
	<view id="bohui" v-show="isShow">
		<view id="confrimBox">
			<view class="header">
				<text>公告信息</text>
			</view>
			<view class="content">
				{{ content }}
			</view>
			<text class="dicon close-model " @click="hide">&#xe93a;</text>
			<!-- <view class="footer close-model">
				<view @click="hide" class="cancel rightBorder">取消</view>
				<view @click="define" class="enter">确定</view>
			</view> -->
		</view>
		
	</view>
</template>

<script>
	// 
	export default {
		props:{
			isShow:{
				type:Boolean,
				default(){
					return false
				}
			},
			// title:{
			// 	type:String,
			// 	default(){
			// 		return ""
			// 	}
			// },
			content:{
				type:String,
				default(){
					return ""
				}
			}
		},
		data() {
			return {
				value: ""
			};
		},
		methods:{
			hide(){
				this.$emit('cancelModal')
			},
			define(){
				this.hide()
				this.$emit('okModal',this.value);
			}
		}
	}
</script>

<style lang="scss" scoped>
	#bohui {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, .7);
		display: flex;
		align-items: center;
		justify-content: space-around;
	}
	#confrimBox {
		width: 80%;
		margin: 0 auto;
		border-radius: 20rpx;
		background-color: #FFFFFF;
		// overflow: hidden;
		margin-top: -10vh;
		min-height: 30vh;
		max-height: 80vh;
		position: relative;
		.header{
			display: block;
			text-align: center;
			padding: 20rpx;
			border-bottom: 1rpx solid #f5f5f5;
			text{
				text-align: center;
				font-size: 40rpx;
				font-family: 500;
				color: red;
			}
		}
		.content{
			padding: 20rpx 30rpx 30rpx;
			max-height: 40vh;
			overflow-y: scroll;
			line-height: 40rpx;
			uni-textarea{
				width: 100%;
				height: 120rpx;
				padding: 4rpx;
				font-size: 28rpx;
			}
		}
		.close-model{
			position: absolute;
			left: 50%;
			bottom: -150rpx;
			z-index: 999;
			transform: translateX(-50%);
			font-size: 80rpx;
			color: #fff;
		}
		.footer{
			display: flex;
			align-items: center;
			flex-wrap: nowrap;
			justify-content: space-between;
			border-top: 2rpx solid #f5f5f5;
			view{
				width: 50%;
				text-align: center;
				padding: 20rpx;
				font-size: 32rpx;
			}
			view:active{
				background-color: rgba($color: $uni-bg-color-grey, $alpha: 1);
			}
			.rightBorder{
				position: relative;
			}
			.rightBorder:after{
				content: "";
				width: 2rpx;
				height: 100%;
				background-color: $uni-bg-color-grey;
				position: absolute;
				top: 0;
				right: 0;
			}
			.cancel{
				color: $uni-text-color-grey;
			}
			.enter{
				color: $uni-color-primary;
			}
		}
	}
</style>

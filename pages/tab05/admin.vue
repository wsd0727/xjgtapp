<template>
	<view class="admin-box text-m">
		<view class="row">
			账号：{{ userInfo.Account }}
		</view>
		<view class="row">
			姓名：{{ userInfo.UserName }}
		</view>
		<view class="row">
			性别：{{ userInfo.Gender ==1? "男" : "女" }}
		</view>
		<view class="row">
			电话：{{ userInfo.Mobile || '' }}
		</view>
		<!-- <view class="row">
			身份证：{{ "" }}
		</view> -->
	</view>
</template>

<script>
		export default{
			data() {
				return {
					userInfo:{}
					}
			},
			onLoad() {
				let _self = this ;
				uni.getStorage({
					key:'userInfo',
					success:function(res){
						_self.userInfo = JSON .parse(res.data) 
						// console.log(res.data);
					}
				})
			}
				
		}
</script>

<style scoped>
	.admin-box{
		width: 500upx;
		margin: 100upx 125upx;
	}
	.admin-box .row{
		padding: 20upx 0;
		border-bottom: 1px solid #AAAAAA;
	}
</style>

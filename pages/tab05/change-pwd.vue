<template>
	<view class="e-container">
		<form @submit="formSubmit" class="login-form">
			<view class="section" :class="inputIndex==1?'solid-bottom-blue':'' ">
				<!-- <view class="section__title">旧密码</view> -->
				<input name="oldpwd" class="text-m" @focus="setActive(1)" placeholder="旧密码"  />
			</view>
			<view class="section" :class="inputIndex==2?'solid-bottom-blue':'' ">
				<!-- <view class="section__title">旧密码</view> -->
				<input class="text-m" name="newpwd" @focus="setActive(2)" type="password" placeholder="新密码"  />
			</view>
			<view class="section" :class="inputIndex==3?'solid-bottom-blue':'' ">
				<!-- <view class="section__title">旧密码</view> -->
				<input name="newpwd2" class="text-m" @focus="setActive(3)" type="password" placeholder="确认新密码"  />
			</view>

			<view class="btn-area" hover-class="e-hover-btn">
				<button formType="submit" class="login-btn" type="primary">提交</button>
			</view>
		</form>
	</view>
</template>

<script>
	import api from '../../common/api.js'
	import md5 from '../../common/md5.js'
	let _self,token;
	export default {
		data() {
			return {
				userId:'',
				userName:'',
				baseUrl:'',
				inputIndex:6
			};
		},
		onLoad: function(params) {
			_self = this;
			uni.getStorage({
					key: 'baseUrl',
					success: function (res) {
							_self.baseUrl= res.data;
					}
			});
			uni.getStorage({
					key: 'token',
					success: function (res) {
							token= res.data;
					}
			});
			uni.getStorage({
				key: 'userId',
				success: function(res) {
					_self.userId = res.data
				}
			});
			uni.getStorage({
				key: 'userName',
				success: function(res) {
					_self.userName = res.data
				}
			});
		},
		methods: {
			setActive(i){
				_self.inputIndex = i 
			},
			formSubmit: function(e) {
				let getFormData= e.detail.value;
				// console.log(JSON.stringify(getFormData));
				if(!getFormData.oldpwd){
					return uni.showToast({
						title: '旧密码不能为空！',
						icon: 'none',
						duration: 1000
					});
				}else if(getFormData.newpwd == ''){
					return uni.showToast({
						title: '新密码不能为空！',
						icon: 'none',
						duration: 1000
					});
				}else if(getFormData.newpwd != getFormData.newpwd2){
					return uni.showToast({
						title: '新密码输入不一致！',
						icon: 'none',
						duration: 1000
					});
				}
				
				
				var dataObj = {
					"oldPwd": md5.hex_md5(getFormData.oldpwd),
					"newPwd": md5.hex_md5(getFormData.newpwd),
					"userName": _self.userName,
					 userId: _self.userId
				}
				// console.log(JSON.stringify(dataObj))
				// console.log(_self.baseUrl +api.apiPublic.setPassword);
				uni.request({
					url:_self.baseUrl +api.apiPublic.setPassword ,
					data: dataObj,
					header: { Authorization:'BasicAuth '+token },
					method:'POST',
					success:function(res){
						// console.log(JSON.stringify(res))
						uni.hideLoading();
						if(res.statusCode == 200 && res.data.IsSuccess){
							uni.showToast({
								title: '保存成功！',
								icon: 'none',
								duration: 1000
							});
							setTimeout(function(){
								uni.navigateBack({
									delta: 1
								})
							},1200)
						}else{
							uni.showToast({
								title: '保存失败'+ res.data.Message,
								icon: 'none',
								duration: 1000
							});
						}
						
					},
					error:function(err){
						console.log(err);
					}
				})
				// console.log(JSON.stringify(e.detail.value))
			}
		}
	}
</script>

<style scoped="">
	.section {
		margin: 40upx;
		border-bottom: 2upx solid #AAAAAA;
	}
	.btn-area {
		margin: 60upx 40upx 0upx 40upx;
	}
</style>

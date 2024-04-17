<template>
	<view class="login-wrapper" :style="{height: allheight}">
		<view class="login-title e-text-c">
			<view class="solid-bottom text-xl padding">
				<text class="text-white text-bold">客商服务平台 </text>
			</view>
			<view class="padding">太原易思软件</view>
		</view>
		<view class="login-card">
			<form @submit="formSubmit" class="login-form">
				<view class="section" :class="inputIndex==1?'solid-bottom-blue':'' ">
					<input name="account" @focus="setActive(1)"  placeholder="账户" v-model="userName" value="userName" />
				</view>
				<view class="section" :class="inputIndex==2?'solid-bottom-blue':'' ">
					<input name="password" @focus="setActive(2)" type="password" v-model="passWord" placeholder="密码" value="passWord" />
				</view>
				
				<view class="section flex-row-between" :class="inputIndex==3?'solid-bottom-blue':'' ">
					<picker @change="bindPickerChange" :value="activeIndex" :range="ipList">
						<view> {{ ipList[activeIndex] || '请选择' }} </view>
					</picker>
					<text class="dicon diconxiangxiazhankai"></text>
				</view>

				<view class="btn-area">
					<button hover-class="e-hover-btn" formType="submit" class="login-btn">登录</button>
					<view class="uni-flex e-flex-bwt">

						<view class="" style="padding: 10px 15px 10px 0;" @click="clearStorages">
							清除缓存
						</view>
						<view class="" style="padding: 10px 0px 10px 15px;" @click="openViews">
							网络配置
						</view>
						<!-- <navigator url="">帮助中心</navigator>
						<navigator url="">忘记密码</navigator> -->
					</view>
				</view>


			</form>
		</view>
		<!-- <view class="setting-btn">
			<button @click="openViews">网络配置</button>
		</view> -->

		<view class="copyright">
			<text>太原易思软件技术有限公司</text>
			<view class="version-wrap">
				当前版本：{{ version }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	
	import api from '@/common/api.js'
	import md5 from '@/common/md5.js'
	import utils from '@/common/util.js'
	let _self, hostIp, clientID,token ;
	export default {
		data() {
			return {
				testPush: '',
				baseUrl: '',
				userName: "",
				passWord: "",
				allheight: "",
				activeIndex: 0,
				inputIndex: 0,
				ipList: ['47.105.207.111:8012'],
				version: plus.runtime.version
			};
		},
		
		onShow: function() {
			uni.getStorage({
				key: 'userName',
				success: function(res) {
					_self.userName = res.data;
				}
			});
			uni.getStorage({
				key: 'passWord',
				success: function(res) {
					_self.passWord = res.data;
				}
			});
			uni.getStorage({
				key: 'ipListStr',
				success: function(res) {
					_self.ipList = JSON.parse(res.data);
				}
			});
			
			uni.getStorage({
				key: 'selectIndex',
				success: function(res) {
					_self.activeIndex = res.data;
				}
			});
			/* console.log(_self.ipList);
			_self.ipList[0] = _self.ipList[0]?_self.ipList:'请配置服务器地址'; */
		},
		onLoad() {
			_self = this;
			_self.getClientInfoEvent();
			let a = plus.push.getClientInfo().clientid ;
			// console.log(a);
		},
		//  返回事件监听
		onBackPress(options){
			if (options.from === 'backbutton') {  
					return true;  
			}  		
		  return false;		
		},
		methods: {
			...mapMutations(['setSOBinfoReduce','setIsSOBReduce']),
			formSubmit: function(e) {
				var formData = {account:_self.userName,password:_self.passWord }  ;
				// console.log(JSON.stringify(formData));
				if (!formData.account || !formData.password) {
					utils.speak('账户和密码不能为空')
					return uni.showToast({
						title: '账户和密码不能为空',
						icon: 'none',
						duration: 1000
					});
				} else if (!_self.ipList[_self.activeIndex] || _self.ipList[_self.activeIndex] == '请选择服务器地址') {
					uni.showToast({
						title: '请检查网络配置和服务器地址',
						icon: 'none',
						duration: 1000
					});
					return setTimeout(() => {
						uni.navigateTo({
							url: 'network'
						});
					}, 500)
				}
			
				const saveData = {
					"Account": formData.account, 
					"Password": md5.hex_md5(formData.password), 
					"DeviceType": 0 ,                            // plus.push.getClientInfo().clientid //  plus.device.uuid
					"PhoneIMEI" : plus.push.getClientInfo().clientid
				}
				hostIp = "http://" + _self.ipList[_self.activeIndex];	
				uni.showLoading({
					mask: true,
					title: '加载中...'
				});
				// console.log(saveData);
				uni.request({
					url: hostIp + api.apiPublic.login,
					data: saveData,
					method: "POST",
					success: (res) => {
						// console.log(JSON.stringify(res));
						if (res.statusCode == 200) {
							if (!res.data.IsSuccess) {
								// utils.speak(`登录失败: ${res.data.Message}`)
								uni.showToast({
									title: `登录失败: ${res.data.Message}`,
									icon: 'none',
									duration: 1000
								});
								return;
							}
							_self.setSOBinfoReduce(res.data.SOBInfos);
							uni.setStorage({
								key: 'baseUrl',
								data: hostIp
							});
							uni.setStorage({
								key: 'selectIndex',
								data: _self.activeIndex
							});
							uni.setStorage({
								key: 'userId',
								data: res.data.UserModel.UserId
							});
							uni.setStorage({
								key: 'token',
								data: res.data.UserModel.Ticket
							});
							uni.setStorage({
								key: 'userName',
								data: res.data.UserModel.Account
							});
							uni.setStorage({
								key: 'passWord',
								data: formData.password
							});
							uni.setStorage({
								key: 'authModel',
								data: JSON.stringify(res.data.AuthModel) 
							});
							uni.setStorage({
								key: 'userInfo',
								data: JSON.stringify(res.data.UserModel)
							});
							token = res.data.UserModel.Ticket ;
							let mapToState = {
								baseUrl: hostIp,
								userInfo: {
									name: formData.account,
									passWord: formData.password,
									userId: res.data.UserModel.UserId,
									type: 1
								}
							}
							utils.runUploadGps(hostIp,res.data.UserModel.Account,res.data.UserModel.UserId);
							// _self.loginReduce(mapToState);
							_self.requestConfig(res.data.ProjectName,res.data.AuthModel) ;
						} else {
							uni.hideLoading();
							uni.showToast({
								title: "服务器接口请求失败，状态码:" + res.statusCode,
								icon: 'none',
								duration: 1000
							});
							return;
						}
			
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: `登录失败,请检查网络配置: ${err.errMsg}`,
							icon: 'none',
							duration: 1000
						});
					}
			
				})
			
			},
			
			openViews: function() {
				uni.navigateTo({
					url: 'network'
				});
			},
			clearStorages(){
				uni.clearStorage();
				uni.showToast({
					title: '缓存已清理！',
					icon: 'none',
					duration: 1000
				});
			},
			requestConfig: function(e,AuthModel) {
				let data = {
					PROJECTNAME: e,
					DEVUCETYPE: 0
				}
				console.log(token,hostIp + api.apiPublic.config);
				uni.request({
					url: hostIp + api.apiPublic.config,
					method:"POST",
					header: { Authorization:'BasicAuth '+token },
					data: data ,
					success: function(res) {
						// console.log(res);
						if (!res.data.IsSuccess) {
							uni.showToast({
								title: '权限配置请求失败' + res.data.Message,
								icon: 'none',
								duration: 2000
							});
							return ;
						}
						let configData = res.data.Result.MODULEMODEL;
						let carPark = res.data.Result.V_BD_PARKCOMPANYS;
						// console.log(JSON.stringify(configData));
						
						uni.setStorage({
							key: 'carPark',
							data: JSON.stringify(carPark)
						});
						_self.resolveData(configData,AuthModel)
					}
				})
			},
			bindPickerChange: function(e) {
				_self.activeIndex = e.target.value
				_self.inputIndex = 3 
			},
			setActive(i){
				_self.inputIndex = i 
			},
			resolveData(configData,AuthModel){
				let authArr = [],sendCarCFG=[],waybillCFG=[],poundCFG=[],homeCFG=[];
				if(AuthModel){
					AuthModel.forEach((item)=>{
						authArr.push(item.ENCODE) 
						if(item.ENCODE=='M401'){ _self.setIsSOBReduce('1') }
					})
				}
				// console.log(authArr);
				//console.log(new Date().toLocaleString());
				for (let i =0 , len = configData.length; i<len;i++) {
					 let item = configData[i] ;
					 let type =  item.PK_FUNCTION ;
					 if(type == 'M0'){ // 采购
						 item.CHILDRENS.forEach((item2)=>{
							 if(item2.PK_FUNCTION == 'M001' && authArr.indexOf('M001') >-1 ){
								  sendCarCFG.push(item2);
							 }else if(item2.PK_FUNCTION == 'M004' && authArr.indexOf('M004') >-1){
								  sendCarCFG.push(item2);
							 }else if(item2.PK_FUNCTION == 'M002' && authArr.indexOf('M002') >-1){
							 		waybillCFG.push(item2);
							 }
							 
						 })
					 }else if(type == 'M1'){ // 销售
						 item.CHILDRENS.forEach((item2)=>{
							  if(item2.PK_FUNCTION == 'M101' && authArr.indexOf('M101')>-1 ){
								  sendCarCFG.push(item2)
							  }else if(item2.PK_FUNCTION == 'M104' && authArr.indexOf('M104')>-1 ){
									sendCarCFG.push(item2)
								}else if(item2.PK_FUNCTION == 'M102' && authArr.indexOf('M102') >-1){
							 		waybillCFG.push(item2);
								}
						 })
						 
					 }else if(type == 'M3'){ // 首页配置
							// 首页里面的菜单配置
							item.CHILDRENS.forEach((item2)=>{
								if( authArr.indexOf(item2.PK_FUNCTION)>-1 ){
									homeCFG.push(item2)
								}
							})
					 }
				}
				// console.log(JSON.stringify(waybillCFG.length));
				// console.log(JSON.stringify(poundCFG.length));
				let allCFG = { homeCFG ,sendCarCFG,waybillCFG,poundCFG  }
				// console.log(JSON.stringify(allCFG));
				uni.setStorage({
					key: 'allCFG',
					data: JSON.stringify(allCFG),
					success: function() {
						// 保存所有配置成功后再保存 派车配置
						uni.hideLoading();
						uni.switchTab({
							url:'../tab01/index'
						})
					}
				}); 
			},
			// 个推的名称为 igexin
			getClientInfoEvent() {
				uni.getProvider({
					service: 'push',
					success: function(res) {
						console.log(JSON.stringify(res));
						// console.log(res.provider)
						if (~res.provider.indexOf('igexin')) {
							uni.subscribePush({
								provider: 'igexin',
								success: function(res) {
									// console.log('success:' + JSON.stringify(res));
								}
							});
						}
					}
				});
			}
		}
	}
</script>

<style scoped="">
	.login-wrapper {
		width: 100%;
		height: 100vh;
		background-image: linear-gradient(to top, #1E9FFF 0%, #00c6fb 100%);
		padding-bottom: 0;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.login-title {
		padding: 10vh;
		color: #FFFFFF;
	}

	.e-text-c {
		text-align: center;
	}

	.e-flex-bwt {
		display: flex;
		justify-content: space-between;
		font-size: 26upx;
		color: #00BFFF;
		margin-top: 20upx;
	}

	.login-card {
		width: 80%;
		margin: 0 10%;
		background: #FFFFFF;
		border-radius: 20upx;
		box-shadow: 0 0upx 16upx #AAAAAA;
	}

	.login-form {
		margin: 20upx;
	}

	.btn-area {
		margin: 60upx 40upx 0upx 40upx;
	}

	.login-btn {
		border: none;
		color: #FFFFFF;
		background-image: linear-gradient(to left, #1E9FFF 0%, #00c6fb 100%) !important;
	}

	.section {
		margin: 40upx;
		border-bottom: 2upx solid #eee;
	}

	.setting-btn {
		width: 80%;
		margin: 40upx 10%;
	}

	.setting-btn button {
		background: none;
		border: 1px solid #eee;
		color: #EEEEEE;
	}

	.copyright {
		width: 100%;
		color: #FFFFFF;
		font-size: 20upx;
		position: absolute;
		bottom: 60upx;
		text-align: center;
		background: transparent;
	}

	.version-wrap {
		font-size: 20upx;
	}

	.e-hover-btn {
		opacity: 0.6;
	}
	/* .section input{caret-color:red;} */
</style>

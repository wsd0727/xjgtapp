<template>
	<view class="login-wrapper" :style="{height: allheight}">
		<view class="login-title e-text-c">
			<view class="solid-bottom text-xl padding">
				<text class="text-white text-bold">
					客商服务平台
					<!-- 连云山客商 -->
				</text>
			</view>
			<view class="padding">
				<!-- 太原易思软件 -->
			</view>
		</view>
		<view class="login-card">
			<form @submit="formSubmit" class="login-form">
				<view class="section text-m">
					<input name="account" class="text-m" placeholder="账户" v-model="userName" value="userName" />
				</view>
				<view class="section text-m">
					<input name="password" class="text-m" type="password" v-model="passWord" placeholder="密码"
						value="passWord" />
				</view>

				<view class="section flex-row-between" :class="inputIndex==3?'solid-bottom-blue':'' ">
					<picker @change="bindPickerChange" :value="activeIndex" range-key="name" :range="serverList">
						<view class="text-m"> {{ serverList.length>0 ? serverList[activeIndex].name : '--请选择服务器地址--' }}
						</view>
					</picker>
					<text class="dicon diconxiangxiazhankai"></text>
				</view>

				<view class="btn-area">
					<button hover-class="e-hover-btn" formType="submit" class="login-btn">登录</button>
					<view class="uni-flex e-flex-bwt">

					<!-- 	<view class="" style="padding: 10px 15px 10px 0;" @click="clearStorages" v-if="!system">
							清除缓存
						</view> -->
						<view class="" style="padding: 10px 15px 10px 0;" @click="register">
							新户注册
						</view>
						<view class="" style="padding: 10px 15px 10px 0;" @click="forgetPassword">
							忘记密码
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

		<view class="copyright">
			<text>太原易思软件技术有限公司</text>
			<view class="version-wrap">
				当前版本：{{ version }}
			</view>
		</view>

		<modal title="高级查询" :content="noticeMsgText" :isShow='isShowModal' @cancelModal='cancelModal'></modal>

	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import model from '@/components/modal/modal.vue'
	import api from '@/common/api.js'
	import md5 from '@/common/md5.js'
	import utils from '@/common/util.js'
	let _self, hostIp, clientID, token, getClientID, noticeMsg;
	// var jpushModule = uni.requireNativePlugin("JG-JPush")

	var GDIPdata = [
		// {
		// 	name: "远大电信",
		// 	ip: "218.76.167.111:8810",
		// 	isadd: false
		// },
		// {
		// 	name: "远大联通",
		// 	ip: "42.48.136.54:8820",
		// 	isadd: false
		// }
	];

	// var GDIPdata = [{
	// 	name: "连云山客商",
	// 	ip: "oa.lianyinshan.cn:81",
	// 	isadd: false
	// }];


	export default {
		data() {
			return {
				isShowModal: false,
				noticeMsgText: '',
				testPush: '',
				baseUrl: '',
				userName: "",
				passWord: "",
				allheight: "",
				activeIndex: 0,
				inputIndex: 0,
				serverList: [],
				version: plus.runtime.version,
				system: false,
				registerID: ''
			};
		},
		components: {
			model
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
				key: 'selectIndex',
				success: function(res) {
					// console.log(res.data);
					_self.activeIndex = res.data;
				}
			});
			// console.log(_self.serverList);
			this.GetServer()
		},
		onLoad() {
			_self = this;
			this.system = plus.os.name == 'iOS' ? true : false
			// console.log(jpushModule);
			if(plus.os.name != 'iOS'){
				_self.getRegisterID();
			}
		},
		//  返回事件监听
		onBackPress(options) {
			if (options.from === 'backbutton') {
				return true;
			}
			return false;
		},
		methods: {
			...mapMutations(['setSOBinfoReduce', 'setIsSOBReduce']),
			
			forgetPassword(){
				let base = 'http://' + _self.serverList[_self.activeIndex].ip;
				// console.log(_self.serverList[_self.activeIndex].ip);
				if (!base) {
					this.$utils.tips('请检查网络配置和服务器地址')
					return setTimeout(() => {
						uni.navigateTo({
							url: 'network02'
						});
					}, 500)
				}
				uni.navigateTo({
					url: 'forgetPassword?baseURL=' + base
				});
				
				
			},

			register() {
				let base = 'http://' + _self.serverList[_self.activeIndex].ip;
				// console.log(_self.serverList[_self.activeIndex].ip);
				if (!base) {
					this.$utils.tips('请检查网络配置和服务器地址')
					return setTimeout(() => {
						uni.navigateTo({
							url: 'network02'
						});
					}, 500)
				}

				uni.navigateTo({
					url: 'register?baseURL=' + base
				});
			},

			// 极光推送获取设备RegisterID 
			getRegisterID() {
				jpushModule.getRegistrationID(result => {
					let registerID = result.registerID
					// console.log(result);
					if (result.code != 0 || registerID == '') {
						_self.getRegistrationID()
					} else {
						_self.registerID = registerID
					}
				})
			},
			// 取消公告
			cancelModal() {
				this.isShowModal = false
				setTimeout(() => {
					uni.switchTab({
						url: '../tab01/index'
					})
				}, 500)
			},
			// 获取服务器地址
			GetServer() {
				uni.getStorage({
					key: "ServerList",
					success: res => {
						console.log(77, _self.serverList);
						// console.log(_self.serverList.length,res.data.length);
						if (_self.serverList.length != 0 && _self.serverList.length != res.data.length) {
							_self.activeIndex = 0
						}
						res.data.push(GDIPdata)
						_self.serverList = res.data;
					},
					fail: err => {
						console.log(44);
						// 请求公用服务器 获取 服务器地址列表
						_self.serverList = GDIPdata
						uni.setStorage({
							key: "ServerList",
							data: data,
							success: function() {
								_self.GetServer();
							}
						});
					}
				});
			},

			// 版本更新
			handleUpdate() {
				this.$utils.handleUpdate(hostIp, token)
			},

			formSubmit: function(e) {
				var formData = {
					account: _self.userName,
					password: _self.passWord
				};

				console.log(JSON.stringify(formData));
				if (!formData.account || !formData.password) {
					utils.speak('账户和密码不能为空')
					return uni.showToast({
						title: '账户和密码不能为空',
						icon: 'none',
						duration: 1000
					});
				} else if (!_self.serverList[_self.activeIndex].ip) {
					uni.showToast({
						title: '请检查网络配置和服务器地址',
						icon: 'none',
						duration: 1000
					});
					return setTimeout(() => {
						uni.navigateTo({
							url: 'network02'
						});
					}, 500)
				}

				const saveData = {
					"Account": formData.account,
					"Password": md5.hex_md5(formData.password),
					"DeviceType": 0, // plus.push.getClientInfo().clientid //  plus.device.uuid
					"PhoneIMEI": this.registerID || formData.account // plus.push.getClientInfo().clientid
				}

				hostIp = "http://" + _self.serverList[_self.activeIndex].ip;
				this.$utils.showLoading()
				// uni.showLoading({
				// 	mask: true,
				// 	title: '加载中...'
				// });
				console.log(hostIp, saveData);
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
							// console.log('d登录后的token=='+res.data.UserModel.Ticket);
							res.data.UserModel.baseUrl = hostIp;
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
							token = res.data.UserModel.Ticket;
							let mapToState = {
								baseUrl: hostIp,
								userInfo: {
									name: formData.account,
									passWord: formData.password,
									userId: res.data.UserModel.UserId,
									type: 1
								}
							}
							utils.runUploadGps(hostIp, res.data.UserModel.Account, res.data.UserModel
								.UserId);
							// _self.loginReduce(mapToState);
							_self.requestConfig(res.data.ProjectName, res.data.AuthModel);
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

			openViews() {
				uni.navigateTo({
					url: 'network02'
				});
			},
			clearStorages() {
				uni.clearStorage();
				uni.showToast({
					title: '缓存已清理！',
					icon: 'none',
					duration: 1000
				});
			},
			requestConfig(e, AuthModel) {
				let data = {
					PROJECTNAME: e,
					DEVUCETYPE: 0
				}
				// console.log(token,hostIp + api.apiPublic.config);
				let params = {
					method: 'POST',
					url: hostIp + api.apiPublic.config,
					data: data,
					token: token
				}
				_self.$axios(params)
					.then(res => {
						let configData = res.Result.MODULEMODEL;
						let carPark = res.Result.V_BD_PARKCOMPANYS;
						noticeMsg = res.Result.BD_Msg || '';
						_self.noticeMsgText = noticeMsg
						console.log(res.Result);
						uni.setStorage({
							key: 'carPark',
							data: JSON.stringify(carPark)
						});
						_self.resolveData(configData, AuthModel)
					})
			},
			bindPickerChange(e) {
				// console.log(_self.serverList);
				// console.log(e.target.value);
				// let val = 0 ;
				// let val = _self.serverList.length==1?0:e.target.value ;
				// console.log(val);
				_self.activeIndex = e.target.value
				_self.inputIndex = 3
				uni.setStorage({
					key: 'selectIndex',
					data: e.target.value
				});
			},
			setActive(i) {
				_self.inputIndex = i
			},
			resolveData(configData, AuthModel) {
				let authArr = [],
					sendCarCFG = [],
					waybillCFG = [],
					poundCFG = [],
					homeCFG = [];

				if (AuthModel) {
					AuthModel.forEach((item) => {
						authArr.push(item.ENCODE)
						if (item.ENCODE == 'M401') {
							_self.setIsSOBReduce('1')
						}
					})
				}
				// console.log(authArr);
				//console.log(new Date().toLocaleString());
				for (let i = 0, len = configData.length; i < len; i++) {
					let item = configData[i];
					let type = item.PK_FUNCTION;
					if (type == 'M0') { // 采购
						item.CHILDRENS.forEach((item2) => {
							if (item2.PK_FUNCTION == 'M001' && authArr.indexOf('M001') > -1) {
								sendCarCFG.push(item2);
							} else if (item2.PK_FUNCTION == 'M004' && authArr.indexOf('M004') > -1) {
								sendCarCFG.push(item2);
							} else if (item2.PK_FUNCTION == 'M002' && authArr.indexOf('M002') > -1) {
								waybillCFG.push(item2);
							}
						})
					} else if (type == 'M1') { // 销售
						item.CHILDRENS.forEach((item2) => {
							if (item2.PK_FUNCTION == 'M101' && authArr.indexOf('M101') > -1) {
								sendCarCFG.push(item2)
							} else if (item2.PK_FUNCTION == 'M104' && authArr.indexOf('M104') > -1) {
								sendCarCFG.push(item2)
							} else if (item2.PK_FUNCTION == 'M102' && authArr.indexOf('M102') > -1) {
								waybillCFG.push(item2);
							}
						})

					} else if (type == 'M3') { // 首页配置
						// 首页里面的菜单配置
						item.CHILDRENS.forEach((item2) => {
							if (authArr.indexOf(item2.PK_FUNCTION) > -1) {
								homeCFG.push(item2)
							}
						})
					}
				}
				// console.log(JSON.stringify(waybillCFG.length));
				// console.log(JSON.stringify(poundCFG.length));
				let allCFG = {
					homeCFG,
					sendCarCFG,
					waybillCFG,
					poundCFG
				}
				// console.log(JSON.stringify(allCFG));
				uni.setStorage({
					key: 'allCFG',
					data: JSON.stringify(allCFG),
					success: function() {
						// 保存所有配置成功后再保存 派车配置
						uni.hideLoading();
						// 延时执行版本检测
						setTimeout(() => {
							_self.handleUpdate()
						}, 5000)

						// 判断是否弹出公告
						if (noticeMsg) {
							_self.isShowModal = true;
						} else {
							uni.switchTab({
								url: '../tab01/index'
							})
						}
					}
				});
			},

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


	uni-picker {
		width: 100%;
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

	.section:focus-within {
		border-bottom: 1rpx solid #0164FF;
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

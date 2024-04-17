<template>
	<view class="mypage">
		<view class="header">
			<view class="avatar-wrap" @click="updateImg">
				<image :src="avatarUrl"></image>
			</view>
			<view class="admin-wrap text-m" @click="handleAbout('admin')">
				<view class="text-black text-xl text-bold"> {{ userInfo.UserName || '' }}</view>
				<view class="text-gray margin-top-xs">手机：{{ userInfo.Mobile || '' }}</view>
				<view class="text-gray">{{ userInfo.CompanyName ||'' }}</view>
			</view>

			<view class="arrow-wrap" @click="handleAbout('admin')">
				<image class="" src="../../static/user/to.png"></image>
			</view>

		</view>
		<view class="list-content">
			<view class="list">
				<view class="li" @click="handleNotice">
					<view class="icon">
						<image src="../../static/user/n/ic_main_wdcd.png"></image>
					</view>
					<view class="text text-black text-m">我要派车</view>
					<image class="to" src="../../static/user/to.png"></image>
				</view>
				<view class="li" @click="handleWaybill">
					<view class="icon">
						<image src="../../static/user/n/ic_main_yijian.png"></image>
					</view>
					<view class="text text-black text-m">我的运单</view>
					<image class="to" src="../../static/user/to.png"></image>
				</view>
			</view>

			<view class="list" v-if="isSOB == 1">
				<picker @change="PickerChange" range-key="SOBNAME" :value="SOBIndex" :range="SOBlist">
					<view class="li picker">
						<view class="icon">
							<image src="../../static/user/n/ic_main_guanyuwomen.png"></image>
						</view>
						<view class="text text-m">厂区切换</view>
						<view class="picker picker-val text-orange">
							{{ SOBlist[SOBIndex].SOBNAME }}
						</view>
						<image class="to" src="../../static/user/to.png"></image>
					</view>
				</picker>
			</view>

			<view class="list">
				<view class="li " @click="handleAbout('help')">
					<view class="icon">
						<image src="../../static/user/n/ic_main_sybz.png"></image>
					</view>
					<view class="text text-m">帮助中心</view>
					<image class="to" src="../../static/user/to.png"></image>
				</view>
				<view class="li " @click="handleAbout('about')">
					<view class="icon">
						<image src="../../static/user/n/ic_main_guanyuwomen.png"></image>
					</view>
					<view class="text text-m">关于我们</view>
					<image class="to" src="../../static/user/to.png"></image>
				</view>
			</view>
			<view class="list text-m">
				<view class="li " @click="handleAbout('change-pwd')">
					<view class="icon">
						<image src="../../static/user/n/ic_main_xiugaimima.png"></image>
					</view>
					<view class="text text-m">密码修改</view>
					<image class="to" src="../../static/user/to.png"></image>
				</view>

				<view class="li " @click="handleUpdate">
					<view class="icon">
						<image src="../../static/user/n/ic_main_fenxiang.png"></image>
					</view>
					<view class="text text-m" style="width: 56%;">版本更新</view>
					<view class="c-orange version-code text-m">
						当前版本: {{ version }}
					</view>
				</view>

				<view class="li noborder" @click="loginOut">
					<view class="icon">
						<image src="../../static/user/n/ic_main_qiehuanjuese2.png"></image>
					</view>
					<view class="text">账户切换/退出</view>
					<image class="to" src="../../static/user/to.png"></image>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import api from '../../common/api.js'
	import utils from '../../common/util.js'
	let _self, baseUrl, token, userId;
	export default {
		computed: mapState(['SOBinfos', 'isSOB']),
		data() {
			return {
				data: {},
				avatarUrl: '',
				userInfo: {},
				SOBIndex: 0,
				SOBlist: [{
					SOBNAME: '默认厂区',
					SOBNO: 'Default'
				}],
				version: plus.runtime.version,
			};
		},
		onLoad() {
			_self = this;
			_self.SOBlist = _self.SOBlist.concat(this.SOBinfos);
			uni.getStorage({
				key: 'baseUrl',
				success: function(res) {
					baseUrl = res.data;
				}
			});
			_self = this;
			uni.getStorage({
				key: 'token',
				success: function(res) {
					token = res.data;
				}
			});
		},
		onShow() {
			uni.getStorage({
				key: 'userInfo',
				success: function(res) {
					_self.userInfo = JSON.parse(res.data)
					_self.avatarUrl = baseUrl + _self.userInfo.HeadIcon
					userId = _self.userInfo.UserId;
					// console.log(_self.userInfo);
				}
			})
		},
		methods: {
			PickerChange(e) {
				this.SOBIndex = e.detail.value;
				let url = baseUrl + '/api/Common/SetSOB?sobNo=' + this.SOBlist[this.SOBIndex].SOBNO;
				// console.log(url);
				uni.request({
					url: url,
					header: {
						Authorization: 'BasicAuth ' + token
					},
					method: 'POST',
					success: (res) => {
						console.log(res);
						if (res.statusCode == 200 && res.data.IsSuccess) {
							uni.showToast({
								title: '切换成功',
								icon: 'none'
							})
						} else {
							uni.showToast({
								title: '切换失败' + res.data.Message,
								icon: 'none'
							})
						}
					}
				})
			},
			handleWaybill() {
				uni.switchTab({
					url: '/pages/tab02/index'
				});
			},
			handleNotice(e) {
				uni.switchTab({
					url: '/pages/tab01/index'
				});
			},
			handleAbout(e) {
				uni.navigateTo({
					url: "/pages/tab05/" + e
				});
			},
			loginOut(e) {
				plus.runtime.restart();
			},
			handleUpdate() {
				this.$utils.handleUpdate(baseUrl,token)
			},

			handleUpdate22() {
				// utils.speak('您已经是最新版本')
				// console.log(baseUrl +api.apiPublic.updateVersion);
				let version = plus.runtime.version;
				// console.log(parseInt(plus.os.version));
				let dcType = plus.os.name == 'iOS' ? 2 : 0;
				// console.log(dcType);
				uni.request({
					url: baseUrl + api.apiPublic.updateVersion,
					data: {
						VERTYPE: dcType
					},
					method: 'POST',
					header: {
						Authorization: 'BasicAuth ' + token
					},
					success: function(res) {
						console.log(JSON.stringify(res));
						// console.log(JSON.stringify(res)) http://139.129.206.158:8207/APK/1.1.0.apk
						if (res.statusCode == 200 && res.data.IsSuccess) {
							// console.log(JSON.stringify(res));
							let result = res.data.Result[0];
							let titles = '请更新该版本！';
							let openUrl = baseUrl + '/' + result.VERURL;
							// let openUrl = 'http://121.28.141.37:8001/APK/SG1.11.190225.apk';
							let message = result.VERMEMO || "更新说明";
							let newVersion = result.VCODE;
							if (newVersion != version) {
								_self.updateApp(openUrl, message, titles)
							} else {
								utils.speak('您已经是最新版本')
								return uni.showToast({
									title: '您已经是最新版本',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			updateApp(downUrl, message, titles) {
				// console.log(downUrl,message,titles)
				uni.showModal({ //提醒用户更新  
					title: titles,
					showCancel: true,
					content: message,
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '下载中...',
								mask: true
							})
							// plus.runtime.openURL(downUrl);
							console.log(downUrl)
							var dtask = plus.downloader.createDownload(downUrl, {}, function(d, status) {
								// 下载完成 
								console.log(d, status)
								if (status == 200) {
									uni.hideLoading();
									plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(error) {
										uni.showToast({
											title: '安装失败',
											mask: false,
											duration: 1500
										});
									})
								} else {
									uni.showToast({
										title: '更新失败',
										mask: false,
										duration: 1500
									});
								}
							});
							dtask.start();
						}
					}
				})
			},
			updateImg() {
				uni.chooseImage({
					count: 1,
					success: (chooseImageRes) => {
						const tempFilePaths = chooseImageRes.tempFilePaths;
						uni.uploadFile({
							url: baseUrl + api.apiPublic.upload,
							filePath: tempFilePaths[0],
							name: 'file',
							header: {
								Authorization: 'BasicAuth ' + token
							},
							formData: {
								'CurrentUserId': userId
							},
							success: (uploadFileRes) => {
								let res = JSON.parse(uploadFileRes.data)
								if (uploadFileRes.statusCode == 200 && res.IsSuccess) {
									_self.avatarUrl = tempFilePaths[0];
								} else {
									uni.showToast({
										title: '上传失败' + uploadFileRes.errMsg,
										icon: 'none'
									});
								}
							}
						});
					}
				});
			}

		}

	}
</script>

<style lang="scss">
	page {
		background-color: #f1f1f1;
		font-size: 30upx;
	}

	.version-code {
		font-size: 20upx;

	}

	.header {
		background: #fff;
		height: 260upx;
		border-bottom: 15upx solid #f1f1f1;
		display: flex;
		align-items: center;
		// padding-bottom: 110upx;
		position: relative;

		.avatar-wrap {
			margin-left: 40upx;
			margin-right: 20upx;

			.margin-top-xs {
				margin-top: 8upx;
			}
		}

		.avatar-wrap image {
			width: 120upx;
			height: 120upx;
			border-radius: 10upx;
		}

		.arrow-wrap {
			position: absolute;
			right: 4%;
			top: 48%;
		}

		.arrow-wrap image {
			width: 30upx;
			height: 30upx;
		}
	}

	.box {
		width: 650upx;
		height: 280upx;
		border-radius: 20upx;
		margin: 0 auto;
		background: #fff;
		box-shadow: 0 5upx 20upx 0upx rgba(0, 0, 150, .2);

		.box-hd {
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
			justify-content: center;

			.avator {
				width: 160upx;
				height: 160upx;
				background: #fff;
				border: 5upx solid #fff;
				border-radius: 50%;
				margin-top: -80upx;
				overflow: hidden;

				img {
					width: 100%;
					height: 100%;
				}
			}

			.phone-number {
				width: 100%;
				text-align: center;
			}
		}

		.box-bd {
			display: flex;
			flex-wrap: nowrap;
			flex-direction: row;
			justify-content: center;

			.item {
				flex: 1 1 auto;
				display: flex;
				flex-wrap: wrap;
				flex-direction: row;
				justify-content: center;
				border-right: 1px solid #f1f1f1;
				margin: 15upx 0;

				&:last-child {
					border: none;
				}

				.icon {
					width: 60upx;
					height: 60upx;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.text {
					width: 100%;
					text-align: center;
					margin-top: 10upx;
					color: black;
				}
			}
		}
	}

	.list-content {
		background: #fff;
	}

	.list {
		width: 100%;
		border-bottom: 15upx solid #f1f1f1;
		background: #fff;

		&:last-child {
			border: none;
		}

		.li {
			width: 100%;
			height: 100upx;
			padding: 0 4%;
			border-bottom: 1px solid rgb(243, 243, 243);
			display: flex;
			align-items: center;

			&.noborder {
				border-bottom: 0
			}

			.icon {
				flex-shrink: 0;
				width: 70upx;
				height: 70upx;

				image {
					width: 70upx;
					height: 70upx;
				}
			}

			.text {
				padding-left: 20upx;
				width: 100%;
				color: #101010;
			}

			.to {
				flex-shrink: 0;
				width: 30upx;
				height: 30upx;
			}

			.picker-val {
				float: right;
				margin-right: 40rpx;
				width: 200rpx;
				text-align: right;
			}
		}
	}
</style>

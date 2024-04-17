<template>
	<view id="register">
		<view class="headers">
			<text class="headtitle">忘记密码</text>
		</view>
		<view class="register_info">
			<ul>
				<li class="uni-flex">
					<!-- <view class="title">姓名</view> -->
					<input type="text" v-model="Form.RealName" placeholder="请输入姓名">
				</li>
				<li class="uni-flex">
					<input type="number" v-model="Form.Phone" maxlength="11" placeholder="请输入手机号码" />
				</li>
				<li class="uni-flex">
					<input type="text" v-model="Form.IDCard" maxlength="18" placeholder="请输入身份证号码" />
				</li>
				<li class="uni-flex">
					<input type="text" v-model="Form.Password" placeholder="请输入新密码" />
				</li>

			</ul>
		</view>
		<view class="Btnbox">
			<button type="primary" @click="register()" class="button_radius" :loading="isSubmit"
				:disabled="isSubmit">提交</button>
		</view>
	</view>
</template>

<script>
	let _self;
	let HOST;
	let URLTYPE;
	import api from '@/common/api.js'
	export default {
		data() {
			return {
				CarTypeList: ["请选择", "A1", "A2", "A3", "B1", "B2", "C1", "C2", "C3"],
				Form: {
					RealName: "",
					SJIDCARD: "",
					Password: "",
					UserPhone: '',
					operateType: 'Register'
				},
				index: 0,
				isSubmit: false
			};
		},
		onLoad(p) {
			_self = this;
			URLTYPE = "Drivers";
			HOST = p.baseURL
		},
		onBackPress() {
			uni.hideKeyboard();
		},
		methods: {
			bindPickerChange(e) {
				this.index = e.target.value;
				this.Form.cartype = this.CarTypeList[this.index];
			},
			switch2Change(e) {
				this.Form.isBlackList = e.target.value;
			},
			register() {
				if (this.Form.RealName == "") {
					return this.$utils.tips('请输入姓名');
				} else if (this.Form.Phone == "") {
					return this.$utils.tips('请输入手机号');
				} else if (this.$utils.isCardID(this.Form.IDCard) != true) {
					return this.$utils.tips('身份证号不能为空或格式错误');
				} else if (this.Form.Password == "" || this.Form.Password.length < 6) {
					return this.$utils.tips('密码不能为空，不能小于6位数');
				}

				this.isSubmit = true;
				// console.log(HOST + '/BA_User/RegisterAccount');
				uni.request({
					url: HOST + '/api/DRIVERPASSWORD/ResetPasswordData',
					method: "POST",
					data: {
						Secretkey: HOST,
						..._self.Form,
						
					},
					success: res => {
						console.log(res);
						_self.isSubmit = false;
						if (!res.data.IsSuccess || res.statusCode != 200) {
							return this.$utils.tips(`修改失败：${res.data.Message}`);
						}
						this.$utils.tips(`修改成功`);
						setTimeout(() => {
							uni.navigateBack()
						}, 1000)
						// this.loginAccount()
					},
					complate: () => {
						_self.isSubmit = false;
						this.$utils.tips('失败，请检查服务器地址或手机网络。');
					},
					fail: (err) => {
						console.log(err);
					}
				});
			},
			selectImg() {
				uni.chooseImage({
					count: 1, //默认9
					success: function(res) {
						console.log(JSON.stringify(res.tempFilePaths));
					},
					fail: err => {
						console.log(err);
					}
				});
			},
			
		}
	};
</script>

<style lang="scss">
	page {
		background-color: #fff;
	}

	#register {
		box-sizing: border-box;
		padding: 30rpx;

		.headers {
			.headtitle {
				display: block;
				margin-top: 30rpx;
				font-size: 44rpx;
			}

			.headtips {
				color: #959595;
				font-size: 20rpx;
			}
		}

		.register_info {
			margin: 30rpx 0;

			ul {
				border-radius: 20rpx;
				list-style: none;
				margin: 0;
				padding: 0;
				overflow: hidden;

				.flex-row {
					justify-content: space-between;
				}

				li {
					background-color: #ffffff;
					padding: 14px 10px;
					display: flex;
					border-bottom: 2rpx solid #F1F1F1;
					font-size: 16px;
					line-height: 28px;

					.title {
						width: 140rpx;
						text-align-last: justify;
						margin-right: 20rpx;
						font-size: 28rpx;
					}

					input {
						height: 30px;
						flex-grow: 1;
						line-height: 28px;
						font-size: 16px;
					}

					.uni-list-cell-db {
						flex-grow: 1;
						position: relative;
						line-height: 28px;
						font-size: 16px;
						text-align: right;
						padding-right: 20px;

						.down {
							position: absolute;
							top: 0;
							right: 0;
						}
					}
				}

				li::before {
					content: "*";
					color: #FF0036;
					margin-right: 10rpx;
				}

				li:focus-within {
					border-color: #0164FF;
				}
			}
		}

		.register_img {
			padding: 15px;
			margin-bottom: 15px;
			background-color: #ffffff;
			font-size: 16px;

			.upload_Btn {
				margin-top: 10px;
				width: 80px;
				height: 80px;
				font-size: 40px;
				text-align: center;
				border: 1px solid #e6e6e6;
				line-height: 80px;
			}
		}

		.Btnbox {
			padding: 30rpx;
		}
	}
</style>
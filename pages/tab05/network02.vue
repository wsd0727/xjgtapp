<template>
	<view id="serverList">
		<ul>
			<li v-for="(serverItem,index) in ServerList" :key="index">
				<view class="title flex">
					<text v-if="!serverItem.isadd" size="14">{{serverItem.name}}</text>
					<input v-else type="text" v-model="serverItem.name" placeholder="请输入服务器名称" />
					<text @click="delServer(index)" class="dicon text-red diconjian-xianxingyuankuang"> </text>
					<!-- <uni-icons
            v-show="serverItem.isadd"
            :type="'minus'"
            :size="'26'"
            class="red"
            @click="delServer(index)"
          ></uni-icons> -->
				</view>
				<text v-if="!serverItem.isadd">{{serverItem.ip}}</text>
				<view class="inputBox" v-else>
					<input type="text" placeholder="请输入服务器地址" v-model="serverItem.ip" />
				</view>
			</li>
		</ul>
		<button type="primary" @click="saveServer" class="button_radius">保存</button>
	</view>
</template>

<script>
	let that;
	let GDIPdata = [
		// {
		// 	name: "远大电信",
		// 	ip: "218.76.167.111:8810",
		// 	isadd: false
		// },
		// {
		// 	name: "远大联通",
		// 	ip: "42.48.136.54:8820",
		// 	isadd: false
		// },
	];
	
	// var GDIPdata = [
	// 	{
	// 		name: "连云山客商",
	// 		ip: "oa.lianyinshan.cn:81",
	// 		isadd: false
	// 	}
	// ];
	export default {
		onLoad() {
			that = this;
		},
		onShow() {
			this.GetServer();
		},
		data() {
			return {
				ServerList: [GDIPdata]
			};
		},
		onNavigationBarButtonTap(obj) {
			this.addServer();
		},
		methods: {
			GetServer() {
				uni.getStorage({
					key: "ServerList",
					success: function(res) {
						// res.data.push(GDIPdata)
						that.ServerList = res.data;
					},
					fail: err => {
						// 请求公用服务器 获取 服务器地址列表
						that.ServerList = GDIPdata
					}
				});
			},
			addServer() {
				let obj = {
					name: "",
					ip: "",
					isadd: true
				};
				for (const i in this.ServerList) {
					if (this.ServerList[i].name == "") {
						uni.showToast({
							title: "请输入网络配置的名称",
							icon: "none",
							duration: 2000
						});
						return false;
					}
					if (this.ServerList[i].ip == "") {
						uni.showToast({
							title: "请输入网络配置的IP地址",
							icon: "none",
							duration: 2000
						});
						return false;
					}
				}
				this.ServerList.push(obj);
			},
			delServer(index) {
				if (this.ServerList.length > 1) {
					this.ServerList.splice(index, 1);
				} else {
					uni.showToast({
						title: "最后一条不可删除",
						icon: "none",
						duration: 1000
					});
				}
			},
			saveServer() {
				let IPReg =
					/(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})(\.(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})){3}:([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
				for (const i in this.ServerList) {
					if (this.ServerList[i].name == "") {
						uni.showToast({
							title: "请输入网络配置的名称",
							icon: "none",
							duration: 2000
						});
						return false;
					}
					if (this.ServerList[i].ip == "") {
						uni.showToast({
							title: "请输入网络配置的IP地址",
							icon: "none",
							duration: 2000
						});
						return false;
					}
					// if (!IPReg.test(this.ServerList[i].ip)) {
					//   uni.showToast({
					//     title: "IP地址格式不正确,请重新输入",
					//     icon: "none",
					//     duration: 2000
					//   });
					//   return false;
					// }
				}
				uni.setStorageSync("ServerList", this.ServerList);
				uni.showToast({
					title: "保存成功",
					duration: 1000
				});
				setTimeout(() => {
					uni.hideToast();
					uni.navigateBack({});
				}, 1000);
			}
		}
	};
</script>

<style lang="scss">
	page {
		background-color: #F5F5F5;
	}

	#serverList {
		padding: 15px;
		box-sizing: border-box;

		ul {
			margin: 0;
			padding: 0;
			margin-bottom: 15px;

			li {
				background-color: #FFFFFF;
				border-radius: 12rpx;
				list-style: none;
				padding: 24rpx;
				margin-bottom: 30rpx;

				view {
					border-bottom: 2rpx solid #eee;
				}

				view:focus-within {
					border-bottom: 2rpx solid #0164FF;
				}

				.inputBox {
					margin-top: 20rpx;
				}

				text,
				input {
					font-size: 32rpx;
					color: #333333;
				}

				.title {
					margin-bottom: 12rpx;

					.dicon {
						font-size: 50rpx;
						color: red;
					}
				}

				.flex {
					display: flex;
					align-items: center;
					justify-content: space-between;

					.red {
						color: #ff0000 !important;
					}
				}
			}
		}


	}
</style>

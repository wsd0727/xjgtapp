<template name="sendcar">
	<view class="mypage" :style="{paddingTop:paddingTop}">
		<scroll-view scroll-x class="bg-white nav fixed" v-if="tabList.length!=1">
			<view class="flex text-center">
				<view class="cu-item flex-sub text-m" :class="index==TabCur?'text-blue cur':''" v-for="(item,index) in tabList" :key="index"
				 @tap="tabSelect(index)">
					{{ tabList[index].FUNCTIONNAME }}({{ AllNumList[index] }})
				</view>
			</view>
		</scroll-view>
		<!--  @click="openDetail(item)" -->
		<view class="card-list-wrapper">
			<view class="card-list-row radius shadow-warp bg-white margin-top" v-for="(item,index) in planList" :key="index"
			 @click="openDetail(item,0)">
				<view class="card-list-row-1" v-for="(itemC,indexC) in tabList[TabCur].DYNAMICMODEL.List" v-if="itemC.ISVISIBLE==1">
					<text class="text-grey text-m">{{ itemC.DISPLAYNAME }}： </text>
					<text class="text-black text-m"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
				</view>

				<view class="order-index">
				</view>
				<view class='order-index-num text-white'>{{ index+1 }}</view>

				<view class="solid-top-gray btn-area" v-if="checkInUrl[TabCur] || invalidUrl[TabCur] || approvalUrl[TabCur] ||eaditUrl[TabCur] || agreementURL[TabCur] ">
					<view class="" v-if="checkInUrl[TabCur]">
						<button class="cu-btn round lines-blue" :disabled="idDisabled01" :loading="idDisabled01" @click.stop="openSetting(item,1)">{{ item.ISQD==1? '已签到':'签到' }}</button>
					</view>

					<view class="" v-if="agreementURL[TabCur]">
						<button class="cu-btn round lines-blue" :disabled="idDisabled01" :loading="idDisabled01" @click.stop="agreementEvent(item,1)">{{ item.VDEF11==1? '已签署':'安全协议' }}</button>
					</view>

					<view class="" v-if="approvalUrl[TabCur]">
						<button class="cu-btn round lines-blue" :disabled="idDisabled02" :loading="idDisabled02" @click.stop="approvalSubmit(item,1)">
							审核 </button>
					</view>

					<view class="" v-if="invalidUrl[TabCur]">
						<button class="cu-btn round lines-blue" :disabled="idDisabled03" :loading="idDisabled03" @click.stop="invalidEventSure(item,4)">{{ '作废' }}</button>
					</view>
					<view class="" v-if="eaditUrl[TabCur]">
						<button class="cu-btn round lines-blue" :disabled="idDisabled04" :loading="idDisabled04" @click.stop="edaitEventSure(item,4)">{{ '编辑' }}</button>
					</view>


					<view class="">
						<button class="cu-btn round lines-blue" @click.stop="openDetail(item,1)">{{ '详情' }}</button>
					</view>
					<view class="">
						<button class="cu-btn round lines-blue" @click.stop="railwayImg(item)">厂内路线图</button>
					</view>
				</view>

			</view>

			<view class="height50"></view>
		</view>

		<w-picker mode="dateTime" startYear="2000" endYear="2050" step="1" :defaultVal="[1,1,1,1,2,5]" :current="true"
		 @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker>
		<view class="nodata-icon-wrap text-grey" v-if="planList.length<1">
			<text class="cuIcon-warn"></text>
			<view>暂无数据</view>
		</view>

		<query-drawer ref="queryDrawer" :queryJsonConfig='queryJsonConfig' :queryJson='queryJson' @querySearch='querySearch'
		 @queryEvent='queryEvent' @resetQuery='resetQuery' @bindPickerChange='bindPickerChange' @hideModal='hideModal'></query-drawer>

	</view>

</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import utils from '@/common/util.js'
	import permision from "@/js_sdk/wa-permission/permission.js"
	import queryDrawer from "@/components/drawer/query_drawer.vue"

	let _self, baseUrl, token, voluationJson, userId,
		queryUrl = [],
		submitUrl, pageList = [],
		totalList = [],
		detailUrl = [],
		initQueryJson = '',
		tabListCFG, carParkList, isAuther;
	let queryParams = {
		StartTime: '1980-01-01 00:00:00',
		EndTime: '2100-01-01 00:00:00',
		userId: '',
		PageInfo: {
			page: 1,
			rows: 10,
			sidx: "BILLNO",
			sord: "DESC"
		}
	}
	export default {
		data() {
			return {
				ColorList: this.ColorList,
				paddingTop: 0,
				startType: 5, // 抽屉的开始日期类型
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				TabCur: 0, // 当前激活项
				scrollLeft: 0,
				CustomBar: this.CustomBar,
				modalName: false,
				planList: [],
				tabList: [],
				dateTimekey: '',
				checkInUrl: [], // 签到提交地址
				signingUrl: [],
				invalidUrl: [], // 作废
				approvalUrl: [], // 审核
				eaditUrl: [], // 编辑
				agreementURL: [], // 安全协议
				queryJsonConfig: [], // 查询条件配置
				queryJson: {}, // 查询条件提交参数
				idDisabled01: false,
				idDisabled02: false,
				idDisabled03: false,
				idDisabled04: false,
				agreementContent:"" , // 安全协议内容
				AllNumList:[],
			};
		},
		components: {
			wPicker,
			queryDrawer
		},
		computed: {
			topHeight() {
				let height = this.CustomBar;
				var style = `padding-top:45px;`;
				return style
			}
		},
		onLoad() {
			_self = this
			pageList[_self.TabCur] = 1;
			totalList[_self.TabCur] = 1;
			this.AllNumList[_self.TabCur] = 0;
			_self.initGetStorage();
		},
		onShow() {

			uni.$on('getSelectItem', (info) => {
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					if (this.modalName) { // 如果查询条件抽屉开启状态 赋值到查询条件里面
						_self.queryJson[tntKey] = info[tntVal];
					}
				})
			})
		},

		onUnload() {
			// 移除监听事件  
			uni.$off('getSelectItem');
		},
		onNavigationBarButtonTap() {
			this.modalName = !this.modalName
			if (this.modalName) {
				_self.showModal('DrawerModalL')
			} else {
				this.$refs.queryDrawer.closeDrawer('showLeft')
			}
		},
		//下拉刷新
		onPullDownRefresh: function() {
			// 重置分页及数据
			// page = 1;
			this.artList = [];
			_self.planList = [];
			pageList[_self.TabCur] = 1;
			totalList[_self.TabCur] = 1;
			this.getNewsList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
			uni.showToast({
				"title": "数据已刷新",
				icon: "none"
			});
		},
		// 加载更多
		onReachBottom: function() {
			this.getNewsList();
		},
		methods: {
			railwayImg(item){
				console.log(item);
				_self.uniSkip.navigateTo({
					url: 'railwayImg?baseUrl=' + baseUrl + '&PK_MATERIAL=' + item.PK_MATERIAL+'&myToken=' +token
					// data: {
					// 	baseUrl: baseUrl,
					// 	myToken: token,
					// 	PK_MATERIAL:item.PK_MATERIAL
					// }
				})
			},
			showModal(e) {
				// console.log(initQueryJson);
				this.$refs.queryDrawer.showDrawer('showLeft')
			},

			hideModal(e) {
				this.modalName = false
			},

			closeDrawer() {
				this.$refs.queryDrawer.closeDrawer('showLeft')
			},

			dateEvent(e) {
				_self.dateTimekey = e.FIELDNAME;
				this.$refs.dateTime.show();
			},
			bindPickerChange({
				val,
				id,
				index
			}) { // 枚举确定
				_self.queryJson[id] = val;
				_self.queryJson[`${id}index`] = index;
			},
			// 初始化查询参数
			initQueryJsonFun(TTT) {
				_self.queryJsonConfig = _self.tabList[_self.TabCur].DYNAMICMODEL.Query;
				// console.log(JSON.stringify(_self.queryJsonConfig) );
				let _formValue = {
					StartTime: '2000-01-01',
					EndTime: utils.GetDateAfter(0)
				};
				_self.queryJsonConfig.forEach((item, index) => {
					let tipText = '';
					_formValue[item.FIELDNAME] = tipText;
					
					if(item.FIELDNAME=='StartTime'){
						// console.log(item);
						if(item.DEFAULTVALUE && item.DEFAULTVALUE.includes('D')){
							let dayNum = item.DEFAULTVALUE.replace('D','')
							_formValue.StartTime= utils.GetDateAfter(dayNum) //  '2000-01-01'
						}else{
							_formValue.StartTime= utils.GetDateAfter(-3) //  '2000-01-01'
						}
						item.ISVISIBLE = 0
					}else if(item.FIELDNAME=='EndTime'){
						_formValue.EndTime = utils.GetDateAfter(0)
						item.ISVISIBLE = 0
					}
					

					if (item.CTRLTYPE == 'ExEnum') {
						let str = item.EXPESSION.split('|');
						let arr = utils.strToArray(str[1]);
						let val = '',
							valIndex = 0;
						// console.log(JSON.stringify(arr));
						let arrlist = item.FIELDNAME + index;
						// _formValue[arrlist] = arr.map((item) => {
						// 	return item.name
						// });
						_formValue[arrlist] = arr
						_formValue[`${item.FIELDNAME}index`] = 0
						if (item.DEFAULTVALUE == '' || item.DEFAULTVALUE == null) {
							_formValue[item.FIELDNAME] = ''
						} else if (item.DEFAULTVALUE == 0) {
							_formValue[item.FIELDNAME] = 0
						}
					}
				})
				// _self.queryJson = _formValue;

				initQueryJson = JSON.parse(JSON.stringify(_formValue));
				_self.queryJson = JSON.parse(JSON.stringify(initQueryJson));
				// this.resetStartTime()
				queryParams = { ...queryParams,
					...initQueryJson
				};
				// console.log(queryParams);
				if(TTT !=1) _self.getNewsList();
			},

			// 重置查询条件
			resetQuery() {
				_self.queryJson = JSON.parse(JSON.stringify(initQueryJson));
			},

			queryEvent() {
				_self.hideModal();
				pageList[_self.TabCur] = 1;
				totalList[_self.TabCur] = 1;
				_self.artList = [];
				_self.planList = [];
				queryParams = { ...queryParams,
					..._self.queryJson
				};
				// console.log(queryParams);
				_self.getNewsList();
			},
			querySearch(e) {
				let ajaxUrlArray = e.EXPESSION.split('|');
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : ''
				// console.log(ajaxUrl);
				if (!ajaxUrl) {
					uni.showToast({
						title: '基础数据配置有误，无法查询',
						icon: 'none',
						duration: 1000
					});
					return null;
				}
				let ajaxParamsArr = ajaxUrl.split('?');
				let requestData = utils.getUrlParamteter(ajaxParamsArr[1])
				voluationJson = ajaxParamsArr[2]
				/* console.log(JSON.stringify(ajaxParamsArr));
				console.log(JSON.stringify(requestData));
				console.log(JSON.stringify(voluationJson)); */
				this.uniSkip.navigateTo({
					url: '../public/search',
					data: {
						url: baseUrl + ajaxParamsArr[0],
						title: '查询' + e.DISPLAYNAME,
						myToken: token,
						requestData: requestData
						// condation: _self.condations
					}
				})
			},
			// 日期确认
			onConfirm(val) {
				// console.log(val);
				_self.formValue[_self.TabCur][_self.dateTimekey] = val.result;
			},

			tabSelect(e) {
				this.hideModal()
				this.closeDrawer()
				_self.artList = [];
				_self.planList = [];
				_self.startType = 5;
				_self.TabCur = e;
				this.scrollLeft = (e - 1) * 60;
				pageList[e] = 1;
				queryParams.StartTime = '1980-01-01 00:00:00';
				this.initQueryJsonFun(1)
				// let tt = JSON.stringify(_self.tabList[e].DYNAMICMODEL.List)
				// console.log(tt);
				_self.getNewsList();
			},
			initGetStorage() {
				uni.getStorage({
					key: 'userInfo',
					success: function(res) {
						let result = JSON.parse(res.data);
						baseUrl = result.baseUrl +'/'
						token = result.Ticket
						userId = result.UserId
						_self.initConfig();
						// console.log(result)
					}
				})
				uni.getStorage({
					key: 'carPark',
					success: function(res) {
						// console.log(res);
						carParkList = res.data ? JSON.parse(res.data) : [];
						// console.log(carParkList)
					}
				})
			},
			initConfig() {
				// 初始化动态配置数据
				uni.getStorage({
					key: 'allCFG',
					success: function(res) {
						let cfgObg = JSON.parse(res.data).waybillCFG;
						let tabLeb = cfgObg.length;
						console.log(cfgObg);
						_self.tabList = cfgObg;
						_self.paddingTop = _self.tabList.length != 1 ? '45px' : '0';
						// console.log(cfgObg);
						cfgObg.forEach((item, index) => {
							// console.log(item.CHILDRENS);
							item.CHILDRENS.forEach((item2, index2) => {
								// console.log(item2.ISFUNCTION);
								if (item2.ISFUNCTION == 2) {
									queryUrl.push(item2.INTERFACEURL)
								} else if (item2.ISFUNCTION == 4) {
									detailUrl.push(item2.INTERFACEURL)
								} else if (item2.ISFUNCTION == 9) { // 作废
									_self.invalidUrl[index] = item2.INTERFACEURL || ''
									// _self.invalidUrl.push(item2.INTERFACEURL)
								} else if (item2.ISFUNCTION == 6) {
									_self.checkInUrl[index] = item2.INTERFACEURL // 签到
									// _self.checkInUrl.push(item2.INTERFACEURL) // 签到
								} else if (item2.ISFUNCTION == 5) {
									_self.signingUrl[index] = item2.INTERFACEURL
									// _self.signingUrl.push(item2.INTERFACEURL)
								} else if (item2.ISFUNCTION == 7) {
									_self.approvalUrl[index] = item2.INTERFACEURL
								} else if (item2.ISFUNCTION == 'E') {
									_self.eaditUrl[index] = item2.INTERFACEURL
								} else if (item2.ISFUNCTION == 'F') {
									_self.agreementURL[index] = item2.INTERFACEURL
								}

							})
							pageList.push(1);
							totalList.push(1);
						})

						_self.initQueryJsonFun()
						// _self.getNewsList();
						// console.log(_self.checkInUrl);
						// console.log(_self.invalidUrl);
						// console.log(_self.approvalUrl);
						// console.log(JSON.stringify(_self.tabList));
					}
				});
			},
			openDetail(e, ok) {
				if (_self.checkInUrl[_self.TabCur] && ok == 0) {
					return null;
				}

				let detailAjaxUrl = detailUrl[_self.TabCur] || '';
				let invalidAjaxUrl = _self.invalidUrl[_self.TabCur] || '';
				let title = _self.tabList[_self.TabCur].FUNCTIONNAME;
				// console.log(detailAjaxUrl);
				// console.log(invalidAjaxUrl);
				if (!detailUrl[_self.TabCur]) {
					return uni.showToast({
						title: '明细接口异常',
						icon: 'none',
						duration: 1000
					})
				}
				_self.uniSkip.navigateTo({
					url: 'detail?baseUrl=' + baseUrl + '&userId=' + userId + '&title=' + title + '&invalidAjaxUrl=' + invalidAjaxUrl +
						'&detailAjaxUrl=' + detailAjaxUrl,
					data: {
						config: _self.tabList[_self.TabCur].DYNAMICMODEL.Detail,
						items: e,
						token: token
					}
				})
			},

			edaitEventSure(d) {
				// console.log(d);
				_self.uniSkip.navigateTo({
					url: 'submit?baseUrl=' + baseUrl + '&userId=' + userId + '&detailAjaxUrl=' + this.eaditUrl[_self.TabCur],
					data: {
						config: _self.tabList[_self.TabCur],
						items: d,
						token: token
					}
				})
			},


			// 审核提交
			approvalSubmit(data) {
				if (!_self.approvalUrl[_self.TabCur]) {
					return this.$utils.tips('未配置审核提交接口');
				}
				let URL = baseUrl + _self.approvalUrl[_self.TabCur];
				// console.log(URL)
				// console.log(data)
				_self.idDisabled02 = true
				this.$axios({
					url: URL,
					data: data,
					token: token,
					isLoading: true
				}).then(res => {
					_self.idDisabled02 = false
					this.$utils.tips('审核成功');
					setTimeout(res => {
						_self.planList = [];
						pageList[_self.TabCur] = 1;
						totalList[_self.TabCur] = 1;
						_self.getNewsList();
					}, 1500)
					// console.log(res)
				}).catch(d => {
					_self.idDisabled02 = false
				})
			},

			setFormat(a, b, c) {
				return utils.setFormat(a, b, c);
			},
			getNewsList() {
				// console.log('888');
				let i = _self.TabCur;
				// console.log(pageList[i],totalList[i]);
				if (pageList[i] > totalList[i]) {
					return uni.showToast({
						title: '没有数据了',
						icon: 'none',
						duration: 1000
					})
				} else if (!queryUrl[i]) {
					return uni.showToast({
						title: '暂无权限',
						icon: 'none',
						duration: 1000
					})
				}
				setTimeout(function() {
					uni.hideLoading();
				}, 50000);
				queryParams.userId = userId;
				queryParams.PageInfo.page = pageList[i]
				queryParams.StartTime = queryParams.StartTime.indexOf(' ') < 0 ? queryParams.StartTime + ' 00:00:00' : queryParams.StartTime,
					queryParams.EndTime = queryParams.EndTime.indexOf(' ') < 0 ? queryParams.EndTime + ' 23:59:59' : queryParams.EndTime
				
				console.log(queryParams);
				_self.$axios({
						url: baseUrl + queryUrl[i],
						data: queryParams,
						// data:testPortData,
						token: token
					})
					.then(res => {
						let {
							Result,
							Message
						} = res;
						if (pageList[i] == 1) {
							_self.planList = Result.rows
						} else {
							_self.planList = _self.planList.concat(Result.rows);
						}
						this.AllNumList[i] = Result.records
						totalList[i] = Result.total || 1;
						pageList[i] = pageList[i] + 1;
						
					})
			},

			invalidEventSure(e) {
				let myurl = baseUrl + _self.invalidUrl[_self.TabCur];
				// console.log(myurl);
				uni.showModal({ //提醒用户更新
					title: '作废提示',
					showCancel: true,
					content: '您确定要作废该运单吗？',
					success: (res) => {
						if (res.confirm) {
							_self.invalidEvent(myurl, e);
						}
					}
				})
			},

			invalidEvent(myurl, data) { // 作废提交
				if (!myurl) {
					return _self.$utils.tips('没有获取到作废接口');
				}
				// console.log(JSON.stringify(data));
				// return ;
				// uni.showLoading({title: '加载中'})
				_self.idDisabled03 = true
				let params = {
					method: 'POST',
					url: myurl,
					data: data,
					token: token
				}
				_self.$axios(params)
					.then(res => {
						let {
							Result,
							Message
						} = res;
						_self.idDisabled03 = false
						_self.$utils.tips('作废成功')
					}).catch(d => {
						_self.idDisabled03 = false
					})
			},
			checkIn(data) {
				// console.log(data)
				if (data.ISQD == 1) {
					uni.showToast({
						title: '该运单已签到',
						icon: 'none'
					});
					return false;
				}
				uni.showLoading({
					title: '加载中'
				});
				let id = data.PK_ORG;
				let carParkData = {
					PK_ORG: data.PK_ORG,
					carParkList: carParkList,
				};
				// console.log(id)
				// console.log(JSON.stringify(carParkList));
				uni.getLocation({
					type: 'gcj02',
					success: function(res) {
						// console.log(res);
						let isOk = utils.judgeSign(carParkData, res.latitude, res.longitude);
						// console.log(carParkData, res.latitude, res.longitude)
						if (!isOk.ok) {
							uni.hideLoading();
							return uni.showToast({
								title: isOk.err,
								icon: 'none'
							})
						}
						isOk.item.PK_PARK = isOk.item.BILLNO || '';
						let savedata = {
							PK_ASSIGNPLAN: data.BILLNO,
							PK_PARK: isOk.item.BILLNO,
							RADIUS: isOk.item.myRADIUS
						};
						savedata.LONGITUDE = res.longitude;
						savedata.LATITUDE = res.latitude;
						_self.saveCheckIn(savedata)
					},
					fail: err => {
						// plus.nativeUI.alert(JSON.stringify(err))
						uni.hideLoading();
						_self.$utils.tips('未获取到定位信息')
						// console.log('定位获取失败');
						// _self.openSetting()
					}
				});
			}, // 签到结束

			openSetting(dataItem) {
				let isIos = (plus.os.name == "iOS");
				var isGPS = permision.checkSystemEnableLocation();
				// console.log(isIos,isGPS);
				if (!isGPS) {
					return _self.$utils.openAllGPS(isIos);
				}
				// console.log(result);
				// 苹果版本 获取权限判断 
			
				isIos ? _self.judgeIosPermission('location', dataItem) : _self.requestAndroidPermission(
					'android.permission.ACCESS_FINE_LOCATION', dataItem)

			},

			async requestAndroidPermission(permisionID, dataItem) {
				var result = await permision.requestAndroidPermission(permisionID)
				if (result) {
					_self.checkIn(dataItem)
				} else {
					uni.showModal({
						content: '为保证签到成功请为【客商服务平台】设置始终允许获取位置服务！',
						showCancel: false,
						success(res) {
							if (res.cancel) {
								return _self.$utils.tips('未授权，无法进行获取定位进行签到')
							}
							_self.$utils.gotoAppPermissionSetting()
						}
					});
				}
			},
			judgeIosPermission(permisionID, dataItem) {
				var result = permision.judgeIosPermission(permisionID)
				// var strStatus = (result) ? _self.checkIn(dataItem) : _self.$utils.gotoAppPermissionSetting()
				if (result) {
					_self.checkIn(dataItem)
				} else {
					uni.showModal({
						content: '为了保证签到成功请为【客商服务平台】设置始终允许获取位置服务！',
						showCancel: false,
						success(res) {
							if (res.cancel) {
								return _self.$utils.tips('未授权，无法获取定位进行签到')
							}
							_self.$utils.gotoAppPermissionSetting()
						}
					});
				}
			},


			signing(item) {
				_self.openDetail(item)
			},
			// 签收结束

			// 签到提交
			saveCheckIn(e) {
				// console.log(e)
				_self.idDisabled01 = true
				let params = {
					method: 'POST',
					url: baseUrl + _self.checkInUrl[_self.TabCur],
					data: e,
					token: token,
					isLoading: true
				}
				_self.$axios(params)
					.then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						_self.idDisabled01 = false
						_self.$utils.tips('签到成功')
						this.artList = [];
						_self.planList = [];
						pageList[_self.TabCur] = 1;
						totalList[_self.TabCur] = 1;
						_self.getNewsList();
						
						console.log('前往公告页');
						_self.uniSkip.navigateTo({
							url: 'notice?baseUrl=' + baseUrl,
							data: {
								url: baseUrl,
								myToken: token,
							}
						})
						
					})
					.catch(d => {
						_self.idDisabled01 = false
					})
			},

			agreementEvent(data) {
				_self.$axios({
						method: 'GET',
						url: baseUrl + "/api/BDMsg/GetFactoryMSG",
						data: {},
						token: token
					})
					.then(res => {
						this.OpenAgreement(res.Result,data)
					}).catch(err=>{
						this.$utils.tips('安全协议获取失败')
					})
			},
			
			OpenAgreement(data,item){
				uni.showModal({
					title: '安全告知',
					content: data ,
					showCancel: false,
					success(res) {
						if (res.confirm) {
							let URL = _self.agreementURL[_self.TabCur]
							item.PK_ASSIGNPLAN = item.BILLNO
							_self.$axios({
									url: baseUrl + URL,
									data: item,
									token: token
								})
								.then(res => {
									_self.$utils.tips('安全协议签署成功')
									setTimeout(d => {
										_self.planList = [];
										pageList[_self.TabCur] = 1;
										totalList[_self.TabCur] = 1;
										_self.getNewsList();
									}, 1500)
								}).catch(err=>{
									this.$utils.tips('安全协议获取失败')
								})
						}
						
						
					}
				});
			},
			
			resetStartTime(){
				let AAA = {
					0:'-300',
					1:0,
					2:-3,
					3:-30
				}
				let SSS  = this.queryJsonConfig.filter(item=>{
					return item.FIELDNAME == 'STIME' ;
				})
				if( Array.isArray(SSS) && SSS.length>0){
					let timeIndex = SSS[0].EXPESSION*1
					initQueryJson.StartTime = this.$utils.GetDateAfter(AAA[timeIndex]);
					queryParams.StartTime = this.$utils.GetDateAfter(AAA[timeIndex]);
				}else {
					initQueryJson.StartTime = '2000-01-01'
				}
			},
			

		}
	}
</script>

<style>
	.height50 {
		height: 50px;
	}

	.card-list-wrapper {
		width: 710upx;
		height: 100upx;
		margin: 0 auto;
	}

	.card-list-row {
		padding: 20upx;
	}

	.card-list-row-1 {
		padding: 10upx 0;
	}

	.cu-form-group {
		display: flex;
		justify-content: space-between;
	}

	.cu-form-group .cu-form-val {
		height: 60upx;
		line-height: 60upx;
	}

	.cu-form-group .cu-form-input input {
		width: 50vw;
		text-align: right;
	}

	.btn-area {
		display: flex;
		justify-content: space-between;
		padding-top: 20upx;
		margin-top: 20upx;
		flex-wrap: wrap;
	}

	.myquery-wrap {
		align-items: center;
	}

	.query-input {
		height: 30rpx;
		line-height: 30rpx;
	}
</style>

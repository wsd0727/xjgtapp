<template name="sendcar">
	<view class="mypage" :style="{paddingTop:paddingTop}">
		<scroll-view scroll-x class="bg-white nav fixed" v-if="tabList.length!=1">
			<view class="flex text-center">
				<view class="cu-item flex-sub text-m" :class="index==TabCur?'text-blue cur':''" v-for="(item,index) in tabList" :key="index"
				 @tap="tabSelect(index)">
					{{ tabList[index].FUNCTIONNAME }}
				</view>
			</view>
		</scroll-view>
		<!-- 一车一单 0 / 一单多车2  :class="index%2==0?'bg-white' :'bg-red-light' " -->
		<view class="card-list-wrapper" v-if='sendCarType == 2 || sendCarType == 0'>
			<view class="card-list-row radius shadow-warp margin-top bg-white"   v-for="(item,index) in planList" :key="index"
			 @click="checkItemOne(item,index)">
				<view class="card-list-row-1" v-for="(itemC,indexC) in tabList[TabCur].DYNAMICMODEL.List" v-if="itemC.ISVISIBLE==1">
					<text class="text-grey text-m">{{ itemC.DISPLAYNAME }}： </text>
					<text class="text-black text-m"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
				</view>
				<view class="order-index">
				</view>
				<view class='order-index-num text-white'>{{ index+1 }}</view>
			</view>
			<view class="height50"></view>
		</view>

		<!-- 一车多单 1 -->
		<view class="card-list-wrapper" v-if='sendCarType == 1'>
			<view class="card-list-row radius shadow-warp bg-white margin-top" v-for="(item,index) in planList" :key="index"
			 @click="checkItem(item,index)">
				<view class="card-list-row-1" v-for="(itemC,indexC) in tabList[TabCur].DYNAMICMODEL.List" v-if="itemC.ISVISIBLE==1">
					<text class="text-grey text-m">{{ itemC.DISPLAYNAME }}：</text>
					<text class="text-black text-m"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
				</view>
				<text v-if="item.check" class="cuIcon-squarecheckfill text-blue remove-btn"></text>

				<view class="order-index">
				</view>
				<view class='order-index-num text-white'>{{ index+1 }}</view>
			</view>
			<view class="height50"></view>
		</view>

		<!-- 无单派车 表单配置 -->
		<view v-if="sendCarType==3" class="card-list-wrapper margin-top-20">
			<form>
				<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-if='item.ISVISIBLE==1'
				 v-for="(item,index) in configForm">
					<view class="title">
						{{ item.DISPLAYNAME }}<text class="text-red" v-if="item.ISREQUESTED==1">*</text>
					</view>
					<!-- <view class="title">控件类型{{ item.CTRLTYPE }}</view> -->

					<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
						{{ formValue[TabCur][item.FIELDNAME] }}
					</view>

					<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
						<input type="text" v-model="formValue[TabCur][item.FIELDNAME]" @focus="setActive(index)" value="" :placeholder="'请输入'+ item.DEFAULTNAME" />
					</view>

					<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item,index)">
						{{ formValue[TabCur][item.FIELDNAME] }}
					</view>

					<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
						{{ formValue[TabCur][item.FIELDNAME] || '' }}
					</view>
				</view>
				<view class="padding-sm" @change="CheckboxChange" v-if="protocol">
					<checkbox class="round blue" :class="checkbox?'checked':''" :checked="checked?true:false" value="A"></checkbox>
					<text class="text-blue" @click="openProtocol">{{ '《'+ protocolTitle +'》' }}</text>
				</view>
				<button class="cu-btn block bg-blue margin-tb-sm lg"
				:disabled="isDisabled"
				:loading="isDisabled"
				 @click="submitForm">
					提交
				</button>
			</form>
		</view>

		<view class="nodata-icon-wrap text-grey" v-if="planList.length<1 && sendCarType!=3">
			<text class="cuIcon-warn"></text>
			<view>暂无数据</view>
		</view>
		<!-- 悬浮按钮 -->
		<view class="next-btn-wrap" @click="nextEvent" v-if='sendCarType == 1'>
			<button class="cu-btn cuIcon bg-blue lg shadow-blur big-btn">
				<text class="cuIcon-forwardfill"></text>
			</button>
		</view>

		<query-drawer ref="queryDrawer" :queryJsonConfig='queryJsonConfig' :queryJson='queryJson' @querySearch='querySearch'
		 @queryEvent='queryEvent' 
		 @resetQuery='resetQuery'
		 @hideModal='hideModal'
		 ></query-drawer>

	</view>

</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import queryDrawer from "@/components/drawer/query_drawer.vue"
	import permision from "@/js_sdk/wa-permission/permission.js"
	import utils from '@/common/util.js'
	var graceChecker = require("../../common/graceChecker.js");
	let _self, baseUrl, myToken, voluationJson, userId, token, webView,
		queryUrl, submitUrl, page = 1,
		total = 1,
		isCheckSubmit = false ,
		selectList = [],
		selectIndexList = [],
		initQueryJson = '' ,
	tabListCFG;
	let queryParams = {
		StartTime: '1980-01-01',
		EndTime: '2100-01-01',
		userId: '',
		PageInfo: {
			page: page,
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
				TabCur: 0,
				scrollLeft: 0,
				modalName: false,
				planList: [],
				tabList: [],
				sendCarType: 0,
				configForm: [],
				formValue: [],
				dateTimekey: '',
				formActiveIndex: 0,
				checkbox: '',
				protocol: '', // 是否启用协议
				protocolMain: '333333', // 协议内容
				protocolUrl: '', // 协议地址 
				protocolTitle: '', // 协议标题
				queryJsonConfig: [], // 查询条件配置
				queryJson: {}, // 查询条件提交参数
				isDisabled:false , // 提交按钮是否可用
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
			webView = this.$mp.page.$getAppWebview();
			// console.log('onLoad==ttt111')
			page = 1
			total = 1
			_self.initGetStorage();
			
		},
		onShow() {
			
			uni.$on('removeItemDCW', (data) => {
				if (data.length > 0) {
					data.forEach((item) => {
						_self.planList[item].check = false
						let i = selectIndexList.indexOf(item);
						if (i < 0) {
							return;
						}
						selectList.splice(i, 1)
						selectIndexList.splice(i, 1)
					})
				}
			})

			uni.$on('getSelectItem', (info) => {
				// console.log(JSON.stringify(info)); 
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				console.log(voluationJsonArr);
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					if (this.modalName) { // 如果查询条件抽屉开启状态 赋值到查询条件里面
						_self.queryJson[tntKey] = info[tntVal];
					} else {
						_self.formValue[_self.TabCur][tntKey] = info[tntVal]
					}
				})
			})
		},

		onUnload() {
			// 移除监听事件  
			uni.$off('getSelectItem');
			uni.$off('removeItemDCW');
		},
		onNavigationBarButtonTap(type) {
			if (type.index == 0 && _self.sendCarType != 3) {
				this.modalName = !this.modalName
				// console.log(this.modalName);
				if(this.modalName){
					_self.showModal('DrawerModalL')
				}else{
					this.$refs.queryDrawer.closeDrawer('showLeft')
				}
				
			}
		},
		//下拉刷新
		onPullDownRefresh: function() {
			if (_self.sendCarType == 3 || this.tabList.length == 0) {
				// console.log('无单派车,不加载数据');
				return uni.stopPullDownRefresh();
			}
			// 重置分页及数据
			page = 1;
			total = 1;
			this.artList = [];
			_self.planList = [];
			selectList = [], selectIndexList = [];
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
			if (_self.sendCarType == 3) {
				// console.log('无单派车,不加载数据');
				return null;
			}
			this.getNewsList();
		},
		methods: {
			showModal(e) {
				this.modalName = true;
				
				this.$refs.queryDrawer.showDrawer('showLeft')
			},
			
			// 初始化查询参数
			initQueryJsonFun(TTT){
				_self.queryJsonConfig = _self.tabList[_self.TabCur].DYNAMICMODEL.Query;
				let _formValue = {StartTime:'2000-01-01',EndTime:utils.GetDateAfter(0)};
				_self.queryJsonConfig.forEach((item, index) => {
					let tipText = '';
					_formValue[item.FIELDNAME] = tipText
					
					if(item.CTRLTYPE == 'ExEnum') {
						let str = item.EXPESSION.split('|');
						let arr = utils.strToArray(str[1]);
						let val = '',
							valIndex = 0;
						let arrlist = item.FIELDNAME + index;
						// _formValue[arrlist] = arr.map((item) => {
						// 	return item.name
						// });
						_formValue[arrlist] = arr
						_formValue[`${item.FIELDNAME}index`] = 0
						if(item.DEFAULTVALUE=='' || item.DEFAULTVALUE==null){
							_formValue[item.FIELDNAME] = ''
						}else if(item.DEFAULTVALUE==0 ){
							_formValue[item.FIELDNAME] = 0
						}
					}
					
					if(item.FIELDNAME=='StartTime'){
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
					
					
					
				})
				initQueryJson = JSON.parse(JSON.stringify(_formValue));
				_self.queryJson = JSON.parse(JSON.stringify(initQueryJson)) ;
				// this.resetStartTime()
				queryParams = { ...queryParams,
					...initQueryJson
				};
				 if(TTT !=1 ){ _self.getNewsList()};
			},
			
			// 重置查询条件
			resetQuery() {
				_self.queryJson = JSON.parse(JSON.stringify(initQueryJson));
				// _self.$set(_self.queryJson.StartTime, '2000-01-01');
			},

			hideModal(e) {
				this.modalName = false
			},
			
			closeDrawer(){
				this.$refs.queryDrawer.closeDrawer('showLeft')
			},
			
			dateEvent(e, i) {
				_self.dateTimekey = e.FIELDNAME;
				this.$refs.dateTime.show();
				_self.formActiveIndex = i;
			},
			
			bindPickerChange({val, id,index}) { // 枚举确定
				_self.queryJson[id] = val;
				_self.queryJson[`${id}index`] = index;
			},
			
			CheckboxChange(e) {
				let values = e.detail.value;
				_self.checkbox = !_self.checkbox
			},
			setFormat(a, b, c) {
				return utils.setFormat(a, b, c);
			},
			
			queryEvent() {
				_self.hideModal();
				page = 1;
				total = 1;
				queryParams = { ...queryParams,
					..._self.queryJson
				};
				// console.log(queryParams);
				_self.artList = [];
				_self.planList = [];
				_self.getNewsList();
			},
			setActive(i) {
				_self.formActiveIndex = i;
			},
			// 日期确认
			onConfirm(val) {
				_self.formValue[_self.TabCur][_self.dateTimekey] = val.result;
			},
			// 获取初始的本地数据
			initGetStorage() {
				uni.getStorage({
					key: 'userInfo',
					success: function(res) {
						let result = JSON.parse(res.data) ;
						baseUrl = result.baseUrl 
						token = result.Ticket
						userId = result.UserId
						_self.initConfig();
						// console.log(result)
					}
				})
			},
			tabSelect(e) {
				//  恢复默认查询条件
				queryParams.StartTime = '2000-01-01 00:00:00';
				_self.TabCur = e;
				// 重置查询条件
				this.initQueryJsonFun(1)
				// 关闭抽屉
				this.hideModal()
				this.closeDrawer()
				// console.log(e);
				this.scrollLeft = (e - 1) * 60;
				_self.sendCarType = _self.tabList[e].CONFIGMODEL[0].VALUE
				_self.artList = [];
				_self.planList = [];
				selectList = [];
				selectIndexList = []
				if (_self.sendCarType == 3) {
					_self.configForm = _self.tabList[e].DYNAMICMODEL.Add;
					submitUrl = _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL;
					let ttwebView = this.$mp.page.$getAppWebview();
					ttwebView.setTitleNViewButtonStyle(0, {
						text: '  ',
					});
					// console.log('派车类型'+_self.sendCarType);
					_self.initForm();
				} else {
					_self.tabList[e].CHILDRENS.forEach((item) => {
						if (item.ISFUNCTION == 2) {
							queryUrl = item.INTERFACEURL
						} else if (item.ISFUNCTION == 3) {
							submitUrl = item.INTERFACEURL
						}
					})
					// queryUrl =  _self.tabList[0].CHILDRENS[0].INTERFACEURL ;
					page = 1;
					total = 1;
					webView.setTitleNViewButtonStyle(0, {
						text: '\ue600',
					});
					// console.log('要去');
					_self.getNewsList();
				}
			},
			initConfig() {
				// 初始化动态配置数据
				// console.log(111);
				uni.getStorage({
					key: 'allCFG',
					success: function(res) {
						// console.log(res.data);
						let cfgObg = JSON.parse(res.data).sendCarCFG;
						// console.log(JSON.stringify(cfgObg));
						let tabLength = cfgObg.length;
						// console.log(tabLength);
						_self.tabList = cfgObg;
						_self.paddingTop = tabLength != 1 ? '45px' : '0';
						_self.sendCarType = _self.tabList[_self.TabCur].CONFIGMODEL[0].VALUE
						// console.log(_self.sendCarType);
						if (_self.sendCarType == 3) { // 无单
							_self.configForm = _self.tabList[_self.TabCur].DYNAMICMODEL.Add;
							submitUrl = _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL;
							isCheckSubmit = _self.tabList[_self.TabCur].CHILDRENS[0].VDEF10 ==1?true:false
							/* 隐藏左上角查询条件按钮 */
							// let tttwebView = this.$mp.page.$getAppWebview();
							webView.setTitleNViewButtonStyle(0, {
								text: ' ',
							});

							_self.initForm();
							// console.log(submitUrl);
						} else if (_self.sendCarType != 3) { // 有单派车，请求数据
							queryUrl = ''; // _self.tabList[0].CHILDRENS[0].INTERFACEURL ;
							_self.tabList[0].CHILDRENS.forEach((item) => {
								if (item.ISFUNCTION == 2) {
									queryUrl = item.INTERFACEURL
								} else if (item.ISFUNCTION == 3) {
									submitUrl = item.INTERFACEURL
								}
							})
							webView.setTitleNViewButtonStyle(0, {
								text: '\ue600',
							});
							// console.log(queryUrl);
							if (queryUrl) {
								_self.initQueryJsonFun();
							}
						}

					}
				});
			},
			openDetail(e) {
				// console.log(token);
				let handelItem = _self.planList[e];
				let title = _self.tabList[_self.TabCur].FUNCTIONNAME;
				let saveuUrl = _self.tabList[_self.TabCur].CHILDRENS[1].INTERFACEURL
				_self.uniSkip.navigateTo({
					url: 'send?baseUrl=' + baseUrl + '&userId=' + userId + '&title=' + title + '&sendCarType=' + _self.sendCarType +
						'&token=' + token,
					data: {
						config: _self.tabList[_self.TabCur].DYNAMICMODEL.Add,
						items: [handelItem] ,
						ajaxUrl: baseUrl + saveuUrl,
						token: token
					}
				})

			},
			searchEvent(e, num) {
				let ajaxUrlArray = e.EXPESSION.split('|');
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : ''
				if (num || num == 0) {
					_self.formActiveIndex = num;
				}

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
						myToken: myToken,
						requestData: requestData
						// condation: _self.condations
					}
				})
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
						myToken: myToken,
						requestData: requestData
						// condation: _self.condations
					}
				})
			},

			submitForm() {
				let data = _self.formValue[_self.TabCur];
				data.userId = userId
				let rule = utils.getRules(_self.configForm);
				var checkRes = graceChecker.check(data, rule);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				this.isDisabled = true
				if(isCheckSubmit){
					this.openSetting(data)
				}else {
					let params = {
						method: 'POST',
						url: baseUrl + submitUrl,
						data: submitdata ,
						token: token
					}
					_self.$axios(params)
						.then(res => {
							_self.isDisabled = false
							_self.$utils.tips('提交成功')
							_self.initForm();
						})
						.catch(e=>{
							_self.isDisabled = false
						})
				}
				// data.LATITUDE = 37.807385
				// data.LONGITUDE = 112.558785
				// data.RADIUS = 1000
			}, // 提交结束
			
			initForm() {
				// console.log('执行表单序列');
				let _formValue = {};
				_self.configForm.forEach((item, index) => {
					let tipText = '';
					if (item.CTRLTYPE == 'ExSearchMatch') {
						tipText = '请选择' + item.DISPLAYNAME;
					} else if (item.CTRLTYPE == 'ExDateTime') {
						tipText = utils.getToDay();
					} else if (item.CTRLTYPE == 'ExAgreement') { // 协议
						_self.protocol = item.ISEDIT
						_self.protocolTitle = item.DISPLAYNAME
					} else if (item.CTRLTYPE == 'ExEditor') { // 协议内容
						_self.protocolUrl = item.EXPESSION.split('|')[1] || '';
						// console.log(_self.protocolUrl);
					}
					_formValue[item.FIELDNAME] = tipText
				})
				// console.log(JSON.stringify(_formValue));
				_self.$set(_self.formValue, _self.TabCur, _formValue);
			},
			getNewsList() {
				// console.log(page,total);
				if (page > total) {
					return uni.showToast({
						title: '没有数据了',
						icon: 'none',
						duration: 1000
					})
				}
				// console.log('执行请求');
				uni.showLoading({
					title: '加载中'
				})
				setTimeout(function() {
					uni.hideLoading();
				}, 5000);
				// queryUrl =  _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL
				queryParams.userId = userId;
				queryParams.PageInfo.page = page
				queryParams.StartTime = queryParams.StartTime.indexOf(' ') < 0 ? queryParams.StartTime + ' 00:00:00' : queryParams.StartTime,
				queryParams.EndTime = queryParams.EndTime.indexOf(' ') < 0 ? queryParams.EndTime + ' 23:59:59' : queryParams.EndTime
				// console.log(JSON.stringify(queryParams));
				// console.log(baseUrl + queryUrl);
				// console.log(token);
				let params = {
					method: 'POST',
					url: baseUrl + queryUrl,
					data: queryParams,
					token: token
				}
				_self.$axios(params)
					.then(res => {
						// console.log('封装的方法');
						let {
							Result,
							Message
						} = res;
						// console.log(Result);
						if (page == 1) {
							if (_self.sendCarType == 1) {
								let checkData = Result.rows.map((item) => {
									item.check = false
									return item;
								})
								_self.planList = checkData
							} else {
								_self.planList = Result.rows
							}
						} else {
							if (_self.sendCarType == 1) {
								let checkData = Result.rows.map((item) => {
									item.check = false
									return item;
								})
								_self.planList = _self.planList.concat(checkData);
							} else {
								_self.planList = _self.planList.concat(Result.rows);
							}
						}
						// console.log(_self.planList);
						total = Result.total || 1;
						page++
					})
			},
			
			checkItemOne(item, i){
				selectIndexList = []
				selectList = []
				selectIndexList.push(i) // 如果选中则追加到 下标数组中
				selectList.push(item)
				this.nextEvent()
			},
			
			// 一车多单时，执行的选中订单事件
			checkItem(item, i) {
				_self.planList[i].check = !_self.planList[i].check;
				_self.planList[i].indexNum = i;
				if (_self.planList[i].check) {
					selectIndexList.push(i) // 如果选中则追加到 下标数组中
					selectList.push(item) // 根据下标获取到选中的数据
				} else {
					let removeIndex = selectIndexList.indexOf(i);
					selectIndexList.splice(removeIndex, 1) // 移除下标
					selectList.forEach((item2, index) => { // 移除选中的数据
						if (item2.indexNum == i) {
							selectList.splice(index, 1)
						}
					})
				}
			},
			nextEvent() {
				if (selectIndexList.length < 1) {
					return uni.showToast({
						title: '请至少选择一个订单',
						icon: 'none'
					});
				}
				let title = _self.tabList[_self.TabCur].FUNCTIONNAME;
				// _self.reachCheckReduce({isReachCheck:false,orderIdList:tntDataList})
				// console.log(submitUrl);
				this.uniSkip.navigateTo({
					url: 'detail?baseUrl=' + baseUrl + '&userId=' + userId + '&title=' + title +'&sendCarType=' + _self.sendCarType ,
					data: {
						list: selectList,
						addCFG: _self.tabList[_self.TabCur].DYNAMICMODEL.Add,
						submitUrl: submitUrl,
						token: token
					}
				})
			},
			// 弹窗显示协议
			openProtocol() {
				let url = baseUrl + _self.protocolUrl;
				utils.openProtocol(url, _self.protocolTitle)
			},
			
			//  签到 成功后 提交表单
			checkIn(submitdata) {
				// console.log(JSON.stringify(submitdata));
				uni.getLocation({
					type: 'gcj02',
					success: function(res) {
						// console.log(res);
						// let isOk = utils.judgeSign(carParkData, res.latitude, res.longitude);
						let tt = utils.GetDistance(submitdata.LATITUDE, submitdata.LONGITUDE ,res.latitude, res.longitude);
						// console.log(tt, submitdata.RADIUS);
						if (tt < submitdata.RADIUS) { // 在允许签到范围内 
							// console.log( baseUrl + submitUrl );
							let params = {
								method: 'POST',
								url: baseUrl + submitUrl,
								data: submitdata ,
								token: token
							}
							_self.$axios(params)
								.then(res => {
									_self.isDisabled = false
									_self.$utils.tips('提交成功')
									_self.initForm();
								})
								.catch(e=>{
									_self.isDisabled = false
								})
						}else{
							_self.isDisabled = false
							_self.$utils.tips('签到失败：未在停车场签到范围内。')
						}
						
					},
					fail: err => {
						// plus.nativeUI.alert(JSON.stringify(err))
						uni.hideLoading();
						_self.isDisabled = false
						_self.$utils.tips('未获取到定位信息')
						// console.log('定位获取失败');
						// _self.openSetting()
					}
				});
			}, // 签到结束
			
			// 签到功能
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

<style scoped>
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

	.remove-btn {
		position: absolute;
		right: 10upx;
		top: 45%;
	}

	
	.cuIcon-squarecheckfill {
		font-size: 50upx;
	}

	.next-btn-wrap {
		position: fixed;
		bottom: 40px;
		right: 20px;
	}

	.next-btn-wrap .cuIcon-forwardfill {
		font-size: 50upx;
	}

	.margin-top-20 {
		margin-top: 20upx;
	}

	.myquery-wrap {
		align-items: center;
	}

	.query-input {
		height: 30rpx;
		line-height: 30rpx;
	}
	.text-m{
		font-size: 36rpx!important;
	}
</style>

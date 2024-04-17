<template name="sendcar">
	<view class="mypage" :style="{paddingTop:paddingTop}">
		<scroll-view scroll-x class="bg-white nav fixed" v-if="tabList.length!=1">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="index==TabCur?'text-blue cur':''" v-for="(item,index) in tabList" :key="index"
				 @tap="tabSelect(index)">
					{{ tabList[index].FUNCTIONNAME }}
				</view>
			</view>
		</scroll-view>

		<view class="" style="display: flex;flex-direction: column;justify-content: center;">



			<view class="card-list-wrapper margin-top-20">
				<form>
					<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-if='item.ISVISIBLE==1'
					 v-for="(item,index) in configForm[TabCur].mainTC">
						<view class="title">
							<text class="text-red" v-if="item.ISREQUESTED==1">*</text>{{ item.DISPLAYNAME }}
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
							{{ configForm[TabCur].mainV[item.FIELDNAME] }}
						</view>
						<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
							<input type="text" @focus="setActive(index)" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'"
							 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
							<input type="number" @focus="setActive(index)" v-if="item.FIELDTYPE == 'number' || item.FIELDTYPE == 'decimal'"
							 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(index)">
							{{ configForm[TabCur].mainV[item.FIELDNAME] }}
						</view>
						<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
							{{ configForm[TabCur].mainV[item.FIELDNAME] }}
						</view>

						<view class="flex-row-between myrow" v-if="item.CTRLTYPE == 'ExEnum' ">
							<picker @change="bindPickerChange($event,item.FIELDNAME,index)" :value="formValue[itemC.FIELDNAME+'VI']" :range="formValue[item.FIELDNAME+index]">
								<view> {{ formValue[item.FIELDNAME+index][formValue[item.FIELDNAME+'VI']] }} </view>
							</picker>
							<text class="cuIcon-triangledownfill text-blue text-bold"></text>
						</view>
					</view>
				</form>
			</view>

			<view class="card-list-wrapper">

				<form>
					<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-if='item.ISVISIBLE==1'
					 v-for="(item,index) in configForm[TabCur].subTC">
						<view class="title">
							<text class="text-red" v-if="item.ISREQUESTED==1">*</text>{{ item.DISPLAYNAME }}
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
							{{ configForm[TabCur].subV[item.FIELDNAME] }}
						</view>
						<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
							<input type="text" @focus="setActive(index)" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'"
							 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
							<input type="number" @focus="setActive(index)" v-if="item.FIELDTYPE == 'number' || item.FIELDTYPE == 'decimal'"
							 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(index)">
							{{ configForm[TabCur].subV[item.FIELDNAME] }}
						</view>
						<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
							{{ configForm[TabCur].subV[item.FIELDNAME] }}
						</view>

						<!-- <view class="flex-row-between myrow" v-if="item.CTRLTYPE == 'ExEnum' ">
						<picker @change="bindPickerChange($event,item.FIELDNAME,index)" :value="formValue[itemC.FIELDNAME+'VI']" :range="formValue[item.FIELDNAME+index]">
							<view> {{ formValue[item.FIELDNAME+index][formValue[item.FIELDNAME+'VI']] }} </view>
						</picker>
						<text class="cuIcon-triangledownfill text-blue text-bold"></text>
					</view> -->
					</view>
				</form>
			</view>

		</view>
		<w-picker mode="dateTime" startYear="2000" endYear="2050" step="1" :defaultVal="[1,1,1,1,2,5]" :current="true"
		 @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker>
	</view>

</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import utils from '@/common/util.js'
	var graceChecker = require("../../../common/graceChecker.js");
	let _self, baseUrl, myToken, voluationJson, userId, token, webView,
		queryUrl, submitUrl, page = 1,
		total = 1,
		selectList = [],
		selectIndexList = [],
		tabListCFG;
	let queryParams = {
		StartTime: utils.getFirstDayOfMonth(new Date()) + ' 00:00:00',
		EndTime: utils.GetDateAfter(0) + ' 23:59:59',
		userId: '',
		PageInfo: {
			page: page,
			rows: 6,
			sidex: "BILLNO",
			sord: "DESC"
		}
	}
	export default {
		data() {
			return {
				ColorList: this.ColorList,
				paddingTop: 0,
				startType: 2, // 抽屉的开始日期类型
				TabCur: 0, // 激活的tabs
				tabList: [],
				scrollLeft: 0,
				modalName: null,
				planList: [],
				marterType: [],
				configForm: [],
				formValue: [],
				dateTimekey: '',
				formActiveIndex: 0,
				checkbox: '',
				protocol: '', // 是否启用协议
				protocolMain: '333333', // 协议内容
				protocolUrl: '', // 协议地址 
				protocolTitle: '' // 协议标题
			};
		},
		components: {
			wPicker
		},
		onLoad(params) {
			_self = this
			userId = params.userId
			baseUrl = params.baseUrl
			this.uniSkip.getParams(function(res) {
				token = res.token;
				_self.tabList = res.CHILDRENS;
				_self.initConfig(res.CHILDRENS);
				// console.log(JSON.stringify(res))
			})
		},
		onShow() {
			// if(_self.tabList.length<1){_self.initConfig()} // 判断初始化配置是否成功
			// uni.getStorage({
			// 	key:'baseUrl',
			// 	success:function(res){
			// 		if(baseUrl != res.data){
			// 			baseUrl = res.data
			// 			_self.initGetStorage();
			// 		}
			// 	}
			// })
			// uni.$on('removeItemDCW',(data)=>{ 
			// 	if(data.length>0){
			// 		data.forEach((item)=>{
			// 			_self.planList[item].check = false
			// 			let i = selectIndexList.indexOf(item) ;
			// 			if(i<0){return;}
			// 			selectList.splice(i,1)
			// 			selectIndexList.splice(i,1)
			// 		})
			// 	}
			// })

			uni.$on('getSelectItem', (info) => {
				// console.log(JSON.stringify(info)); 
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				// console.log(voluationJsonArr);
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					_self.configForm[_self.TabCur].mainV[tntKey] = info[tntVal]
				})
			})
		},

		onUnload() {
			// 移除监听事件  
			uni.$off('getSelectItem');
			// uni.$off('removeItemDCW'); 
		},
		onNavigationBarButtonTap(type) {
			// console.log(type);
			if (type.index == 0 && _self.sendCarType != 3) {
				_self.showModal('DrawerModalL')
			}
		},
		//下拉刷新
		onPullDownRefresh: function() {
			if (_self.sendCarType == 3) {
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
			dateEvent(i) {
				_self.formActiveIndex = i;
				this.$refs.dateTime.show();
				_self.dateTimekey = _self.configForm[_self.TabCur].mainTC[i].FIELDNAME;
			},

			showModal(e) {
				this.modalName = e
			},
			hideModal(e) {
				this.modalName = null
			},
			CheckboxChange(e) {
				let values = e.detail.value;
				_self.checkbox = !_self.checkbox
			},
			setFormat(a, b, c) {
				if (a && c) {
					return utils.setFormat(a, b, c);
				}
				if (b == null || b == '') {
					return '';
				} else if (b == 0) {
					return 0;
				}
				return b;
			},

			setActive(i) {
				_self.formActiveIndex = i;
			},
			// 日期确认
			onConfirm(val) {
				// console.log(val);
				_self.configForm[_self.TabCur].mainV[_self.dateTimekey] = val.result;
			},

			initConfig(data) {
				// 初始化动态配置数据
				// console.log(111);
				let tabLength = data.length;
				_self.paddingTop = tabLength != 1 ? '45px' : '0';
				// _self.marterType = _self.tabList[_self.TabCur].CONFIGMODEL[0].VALUE //  0 单物料  1多物料
				if (tabLength == 1) {
					_self.paddingTop = 0;
					_self.marterType = _self.tabList[_self.TabCur].CONFIGMODEL[0].VALUE
					_self.configForm = data[i].DYNAMICMODEL.Add;
				} else {
					let formconfig = [],
						type = [];
					for (let i = 0; i < tabLength; i++) {
						let item = data[i];
						formconfig.push(item.DYNAMICMODEL.Add);
						type.push(item.CONFIGMODEL[0].VALUE)
					}
					_self.marterType = type;
					// _self.configForm = formconfig ;
					_self.initMainSub(formconfig);
					// console.log(_self.marterType);
					// console.log(JSON.stringify(formconfig))
				}


			},
			openDetail(e) {
				console.log(token);
				let title = _self.tabList[_self.TabCur].FUNCTIONNAME;
				let saveuUrl = _self.tabList[_self.TabCur].CHILDRENS[1].INTERFACEURL
				_self.uniSkip.navigateTo({
					url: 'send?baseUrl=' + baseUrl + '&userId=' + userId + '&title=' + title + '&sendCarType=' + _self.sendCarType +
						'&token=' + token,
					data: {
						config: _self.tabList[_self.TabCur].DYNAMICMODEL.Add,
						items: e,
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
					url: '../../public/search',
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
				// let submitAjaxUrl = _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL ;
				// console.log(JSON.stringify(data));
				// console.log(token);
				data.userId = userId
				let rule = utils.getRules(_self.configForm);
				var checkRes = graceChecker.check(data, rule);
				// console.log(data);
				// console.log(checkRes);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}

				uni.request({
					url: baseUrl + submitUrl,
					data: [data],
					header: {
						Authorization: 'BasicAuth ' + token
					},
					method: "POST",
					success: function(res) {
						console.log(res);
						if (res.data.IsSuccess && res.statusCode == 200) {
							uni.showToast({
								title: '提交成功',
								icon: 'none',
								duration: 1000
							});
							_self.initForm();
						} else {
							uni.showToast({
								title: '提交失败:' + res.data.Message,
								icon: 'none',
								duration: 2000
							});
						}
					}

				})
			}, // 提交结束
			initForm(data) {
				// console.log('执行表单序列');
				let _formValue = {
					detail: {}
				};
				data.forEach((item, index) => {
					let tipText = '';
					if (item.GROUPID.slice(-2) == '01') {
						// mainTbaleA.push(item)
						if (item.ISVISIBLE == 0) {
							_formValue[item.FIELDNAME] = item.DEFAULTVALUE;
							return;
						} else if (item.CTRLTYPE == 'ExSearchMatch') {
							tipText = '请选择' + item.DISPLAYNAME;
							if (item.ISVISIBLE == 0) {
								tipText = ''
							}
						} else if (item.CTRLTYPE == 'ExTextBox') {
							tipText = item.DEFAULTVALUE;
						} else if (item.CTRLTYPE == 'ExDateTime') {
							tipText = utils.resolveDate(item.DEFAULTVALUE);
							console.log(tipText);
						} else if (item.CTRLTYPE == 'ExUpload') {
							_formValue['img' + index] = '';
						} else if (item.CTRLTYPE == 'ExEnum') {
							let str = item.EXPESSION.split('|');
							let arr = utils.strToArray(str[1]);
							let valIndex = item.DEFAULTVALUE || 0;
							let arrlist = item.FIELDNAME + index;
							_formValue[arrlist] = arr.map((item) => {
								return item.name;
							});
							tipText = valIndex;
							_formValue[item.FIELDNAME + 'VI'] = valIndex;
							_formValue[item.FIELDNAME + 'List'] = arr;
						}

					} else {
						subTableA.push(item)
					}




				})
				// console.log(JSON.stringify(_formValue));
				// _self.$set(_self.formValue,  _self.TabCur, _formValue);
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
				// console.log(JSON.stringify(queryParams));
				// console.log(baseUrl + queryUrl);
				// console.log(token);
				uni.request({
					url: baseUrl + queryUrl,
					data: queryParams,
					header: {
						Authorization: 'BasicAuth ' + token
					},
					method: "POST",
					success: function(res) {
						uni.hideLoading();
						// utils.delayHide();
						if (res.data.IsSuccess) {
							if (page == 1) {
								if (_self.sendCarType == 1) {
									let checkData = res.data.Result.rows.map((item) => {
										item.check = false
										return item;
									})
									_self.planList = checkData
								} else {
									_self.planList = res.data.Result.rows
								}

							} else {
								if (_self.sendCarType == 1) {
									let checkData = res.data.Result.rows.map((item) => {
										item.check = false
										return item;
									})
									_self.planList = _self.planList.concat(checkData);
								} else {
									_self.planList = _self.planList.concat(res.data.Result.rows);
								}
							}
							// console.log(_self.planList.length);
							total = res.data.Result.total || 1;
							// console.log(total);
							page++
						}
						// console.log(JSON.stringify(res));
					},
					error: function(err) {
						uni.hideLoading();
						// console.log(JSON.stringify(err));
					}
				})

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
					url: 'detail?baseUrl=' + baseUrl + '&userId=' + userId + '&title=' + title,
					data: {
						list: selectList,
						addCFG: _self.tabList[_self.TabCur].DYNAMICMODEL.Add,
						submitUrl: submitUrl,
						token: token
					}
				})
			},
			initMainSub(data) {
				let allconfig = [],
					one = {};
				for (let i = 0; i < data.length; i++) {
					let mainTbaleA = [],
						subTableA = [],
						mainVal = {},
						subVal = {};
					data[i].forEach((item) => {
						if (item.GROUPID.slice(-2) == '01') {
							mainTbaleA.push(item)
							if (item.ISVISIBLE == 0) {
								mainVal[item.FIELDNAME] = item.DEFAULTVALUE;
								return;
							} else if (item.CTRLTYPE == 'ExSearchMatch') {
								let tipText = '请选择' + item.DISPLAYNAME;
								if (item.ISVISIBLE == 0) {
									tipText = ''
								}
								mainVal[item.FIELDNAME] = tipText;
							} else if (item.CTRLTYPE == 'ExTextBox') {
								// mainVal = item.DEFAULTVALUE;
								mainVal[item.FIELDNAME] = item.DEFAULTVALUE;
							} else if (item.CTRLTYPE == 'ExDateTime') {
								let a = utils.resolveDate(item.DEFAULTVALUE);
								mainVal[item.FIELDNAME] = a;
							} else if (item.CTRLTYPE == 'ExEnum') {
								let str = item.EXPESSION.split('|');
								let arr = utils.strToArray(str[1]);
								let valIndex = item.DEFAULTVALUE || 0;
								let arrlist = item.FIELDNAME + index;
								mainVal[arrlist] = arr.map((item) => {
									return item.name;
								});
								let tipText = valIndex;
								mainVal[item.FIELDNAME + 'VI'] = valIndex;
								mainVal[item.FIELDNAME + 'List'] = arr;
							}

						} else {
							subTableA.push(item)
							subVal[item.FIELDNAME] = "";
						}
					})

					let mtone = {
						mainTC: mainTbaleA,
						subTC: subTableA,
						mainV: mainVal,
						subV: subVal
					};
					allconfig.push(mtone);
				}
				_self.configForm = allconfig;
				// console.log(JSON.stringify(allconfig[0]))	

			}
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
</style>

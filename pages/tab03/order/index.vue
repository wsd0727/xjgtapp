<template name="sendcar">
	<!-- 采购 销售的订单新增 -->
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
					<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-for="(item,index) in configForm[TabCur]"
					 v-if='item.ISVISIBLE'>
						<view class="title">
							<text class="text-red" v-if="item.ISREQUESTED==1">*</text>{{ item.DISPLAYNAME }}
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
							{{ formValue[TabCur][item.FIELDNAME] }}
						</view>
						<!-- v-model="formValue[TabCur][item.FIELDNAME]" -->
						<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
							<input type="text" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'" v-model="formValue[TabCur][item.FIELDNAME]"
							 :placeholder="'请输入'+ item.DISPLAYNAME" />
							<input type="number" v-if="item.FIELDTYPE == 'number' || item.FIELDTYPE == 'decimal'" v-model="formValue[TabCur][item.FIELDNAME]"
							 :placeholder="'请输入'+ item.DISPLAYNAME" />
						</view>

						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(index)">
							{{ formValue[TabCur][item.FIELDNAME] }}
						</view>

						<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
							{{ formValue[TabCur][item.FIELDNAME] }}
						</view>

						<view class="flex-row-between myrow" v-if="item.CTRLTYPE == 'ExEnum' ">
							<picker @change="bindPickerChange($event,index)" :value="formValue[TabCur][item.FIELDNAME+'VI']" :range="formValue[TabCur][item.FIELDNAME+'List']"
							 range-key="name">
								<view> {{ formValue[TabCur][item.FIELDNAME+'List'][formValue[TabCur][item.FIELDNAME+'VI']].name }} </view>
							</picker>
							<text class="cuIcon-triangledownfill text-blue text-bold"></text>
						</view>
					</view>

					<button class="cu-btn block bg-blue margin-tb-sm lg" @click="submitForm">
						提交
					</button>
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
		queryUrl, submitUrl = [],
		page = 1,
		total = 1,
		selectList = [],
		selectIndexList = [],
		searchDataConfig= [],
		tabListCFG;
	let queryParams = {
		StartTime: utils.getFirstDayOfMonth(new Date()) + ' 00:00:00',
		EndTime: utils.GetDateAfter(0) + ' 23:59:59',
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
			// console.log(999);
			this.uniSkip.getParams(function(res) {
				token = res.token;
				_self.tabList = res.CHILDRENS;
				// console.log(JSON.stringify(_self.tabList))
				_self.initConfig(res.CHILDRENS);
			})
		},
		onShow() {
			// if(_self.tabList.length<1){_self.initConfig()} // 判断初始化配置是否成功
			uni.$on('getSelectItem', (info) => {
				// console.log(JSON.stringify(info)); 
				// console.log(voluationJson);
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				// console.log(voluationJsonArr);
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					_self.formValue[_self.TabCur][tntKey] = info[tntVal]
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

		methods: {
			dateEvent(i) {
				// console.log(i);
				_self.formActiveIndex = i;
				this.$refs.dateTime.show();
				_self.dateTimekey = _self.configForm[_self.TabCur][i].FIELDNAME;
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
			getValue(e, i) {
				// let val = e.target.value;
				// let id  = _self.configForm[_self.TabCur][i].FIELDNAME ;
				// _self.formValue[_self.TabCur][id] = val;
				// _self.list[i] = val;
			},
			tabSelect(e) {
				_self.TabCur = e;
				// console.log(e);
				this.scrollLeft = (e - 1) * 60;
			},

			// setActive(e,i) {
			// 	_self.formActiveIndex = i;
			// },
			// 日期确认
			onConfirm(val) {
				_self.formValue[_self.TabCur][_self.dateTimekey] = val.result;
			},
			bindPickerChange: function(e, n) {
				_self.formActiveIndex = n;
				let val = e.target.value;
				let id = _self.configForm[_self.TabCur][n].FIELDNAME;
				_self.formValue[_self.TabCur][id + 'VI'] = val;
				_self.formValue[_self.TabCur][id] = _self.formValue[_self.TabCur][id + 'List'][val].id;
				// console.log(_self.formValue[_self.TabCur]);
			},
			initConfig(data) {
				// 初始化动态配置数据
				let tabLength = data.length;
				_self.paddingTop = tabLength != 1 ? '45px' : '0';
				let formconfig = [];
				// console.log(JSON.stringify(data));
				if (tabLength == 1) {
					_self.paddingTop = 0;
					formconfig.push(data[0].DYNAMICMODEL.Add);
					submitUrl.push(data[0].INTERFACEURL)
					this.$utils.setPageTitle(data[0].FUNCTIONNAME)
					// formconfig = data[0].DYNAMICMODEL.Add;
				} else {
					for (let i = 0; i < tabLength; i++) {
						let itemA = data[i];
						formconfig.push(itemA.DYNAMICMODEL.Add);
						itemA.CHILDRENS.forEach((item) => {
							if (item.ISFUNCTION == 3) {
								submitUrl.push(item.INTERFACEURL)
							}
						})
					}
				}
				_self.configForm = JSON.parse(JSON.stringify(formconfig));
				_self.initForm(_self.configForm);

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
				let requestData = utils.getUrlParamteter(ajaxParamsArr[1]);
				// 做级联判断 ，如果存在第四个
				if (ajaxParamsArr[3]) {
					let jbl = ajaxParamsArr[3].split('=');
					if (!_self.formValue[_self.TabCur][jbl[1]]) { // 获取上级数据id
						return uni.showToast({
							title: '上一级信息不能为空',
							icon: 'none'
						})
					} else {
						requestData[jbl[0]] = _self.formValue[_self.TabCur][jbl[1]]
					}
				} else if (e.VMEMO) { // 如果点击的时父级清除子集数据
					let clearArr = e.VMEMO.split(',');
					clearArr.forEach((itemc) => {
						let tnt = itemc.split('=');
						_self.formValue[_self.TabCur][tnt[0]] = tnt[1] || '';
					})

				}
				voluationJson = ajaxParamsArr[2]
				// console.log(JSON.stringify(ajaxParamsArr));
				// console.log(JSON.stringify(requestData));
				// console.log(JSON.stringify(voluationJson));
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
				// console.log(11);
				let data = _self.formValue[_self.TabCur];
				let savedata = _self.mainSubValue(_self.configForm[_self.TabCur], data);
				savedata.userId = userId
				// console.log(JSON.stringify(savedata));
				let rule = utils.getRules(_self.configForm[_self.TabCur]);
				var checkRes = graceChecker.check(data, rule);
				// console.log(rule);
				// console.log(JSON.stringify(rule));
				// console.log(checkRes);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				// console.log(baseUrl + submitUrl[_self.TabCur]);
				_self.$axios({
						url: baseUrl + submitUrl[_self.TabCur],
						token: token,
						isLoading: true ,
						data: savedata
					})
					.then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						_self.$utils.tips('提交成功')
						_self.initForm(_self.configForm);
					})
			}, // 提交结束
			initForm(data) {
				// console.log(JSON.stringify(data))
				let formValueArr = [];
				for (let i = 0; i < data.length; i++) {
					let _formValue = {};
					data[i].forEach( (item, index) => {
						let tipText = item.DEFAULTVALUE || '';
						if (item.ISVISIBLE == 0) {
							_formValue[item.FIELDNAME] = item.DEFAULTVALUE;
						} else if (item.CTRLTYPE == 'ExSearchMatch') {
							if (!item.DEFAULTVALUE) {
								tipText = '请选择' + item.DISPLAYNAME;
							} else if (item.DEFAULTVALUE == 'search') {
								tipText = ''
								searchDataConfig.push(item)
							}
						} else if (item.CTRLTYPE == 'ExTextBox') {
							tipText = item.DEFAULTVALUE;
						} else if (item.CTRLTYPE == 'ExDateTime') {
							tipText = utils.resolveDate(item.DEFAULTVALUE);
						} else if (item.CTRLTYPE == 'ExUpload') {
							_formValue['img' + index] = '';
						} else if (item.CTRLTYPE == 'ExEnum') {
							let str = item.EXPESSION.split('|');
							let arr = utils.strToArray(str[1]);
							let valIndex = item.DEFAULTVALUE || 0;
							arr.forEach((item, index) => {
								if (item.id == item.DEFAULTVALUE) {
									_formValue[item.FIELDNAME + 'VI'] = index;
									return;
								}
							});
							tipText = valIndex;
							_formValue[item.FIELDNAME + 'VI'] = valIndex;
							_formValue[item.FIELDNAME + 'List'] = arr;
						}
						_formValue[item.FIELDNAME] = tipText
					})
					formValueArr.push(_formValue);
					// console.log(JSON.stringify(_formValue))
				} // 最外层循环结束
				// console.log(JSON.stringify(formValueArr))
				_self.formValue = JSON.parse(JSON.stringify(formValueArr));
				
				this.searchLoop();
			},
			mainSubValue(dataConfig, dataVal) { // 把值转换为主子表结构
				// console.log(dataVal);
				// console.log(dataConfig);
				let submitData = {
						DTL: []
					},
					detail = {};
				dataConfig.forEach((item) => {
					if (item.GROUPID.slice(-2) == '01') {
						submitData[item.FIELDNAME] = dataVal[item.FIELDNAME]
					} else {
						detail[item.FIELDNAME] = dataVal[item.FIELDNAME]
					}
				})
				submitData.DTL = [{ ...detail
				}];
				return submitData;
			},
			
			searchLoop(data) {
				let ttt =function(i){
					if(i>searchDataConfig.length){
						return ;
					}else{
						let e = searchDataConfig[i];
						let ajaxUrlArray = e.EXPESSION.split('|');
						let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : '';
						if (!ajaxUrl) {
							uni.showToast({
								title: '基础数据配置有误，无法查询',
								icon: 'none',
								duration: 1000
							});
							return null;
						}
						let ajaxParamsArr = ajaxUrl.split('?');
						let requestData = utils.getUrlParamteter(ajaxParamsArr[1]);
						// 做级联判断 ，如果存在第四个
						if (ajaxParamsArr[3]) {
							let jbl = ajaxParamsArr[3].split('=');
							if (!_self.formValue[0][jbl[1]]) { // 获取上级数据id
								return uni.showToast({
									title: '上一级信息不能为空',
									icon: 'none'
								})
							} else {
								requestData[jbl[0]] = _self.formValue[0][jbl[1]]
							}
						} else if (e.VMEMO) { // 如果点击的时父级清除子集数据
							let clearArr = e.VMEMO.split(',');
							clearArr.forEach((itemc) => {
								let tnt = itemc.split('=');
								_self.formValue[tnt[0]] = tnt[1] || '';
							})
						}
						// console.log('i=33==='+i);
						voluationJson = ajaxParamsArr[2];
						let requestDataInIt = {
							...requestData,
							VNAME: '',
							PageInfo: {
								page: 1,
								rows: 100,
								sidx: "BILLNO",
								sord: "DESC"
							}
						};
						// console.log(requestDataInIt)
						let URL = baseUrl + ajaxParamsArr[0] ;
						// console.log(URL)
						// 执行查询
						 _self.$axios({
							method: 'POST',
							url: URL,
							data: requestDataInIt,
							token: token,
						}).then(res => {
							let {
								IsSuccess,
								Result,
								Message
							} = res;
							let cc = e.VMEMO || 0;
							uni.$emit('getSelectItem', { ...Result.rows[cc]});
							i+=1 ;
							ttt(i)
						})
						
						
						
					}
				}
				
				ttt(0);
				
			},
			
			// 初始化查询默认第一个值
			async initSearch(e, num) {
				console.log( new Date().getTime() )
				// console.log(e, num)
				
				
				// return new Promise( (resolve, reject)=>{
					
					let ajaxUrlArray = e.EXPESSION.split('|');
					let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : '';
					if (num || num == 0) {
						_self.formActiveIndex = num;
					}
					if (!ajaxUrl) {
						uni.showToast({
							title: '基础数据配置有误，无法查询',
							icon: 'none',
							duration: 1000
						});
						return null;
					}
					let ajaxParamsArr = ajaxUrl.split('?');
					let requestData = utils.getUrlParamteter(ajaxParamsArr[1]);
					// 做级联判断 ，如果存在第四个
					if (ajaxParamsArr[3]) {
						let jbl = ajaxParamsArr[3].split('=');
						if (!_self.formValue[jbl[1]]) { // 获取上级数据id
							return uni.showToast({
								title: '上一级信息不能为空',
								icon: 'none'
							})
						} else {
							requestData[jbl[0]] = _self.formValue[jbl[1]]
						}
					} else if (e.VMEMO) { // 如果点击的时父级清除子集数据
						let clearArr = e.VMEMO.split(',');
						clearArr.forEach((itemc) => {
							let tnt = itemc.split('=');
							_self.formValue[tnt[0]] = tnt[1] || '';
						})
					}
					voluationJson = ajaxParamsArr[2];
					let requestDataInIt = {
						...requestData,
						VNAME: '',
						PageInfo: {
							page: 1,
							rows: 100,
							sidx: "BILLNO",
							sord: "DESC"
						}
					};
					console.log(requestDataInIt)
					let URL = baseUrl + ajaxParamsArr[0] ;
					console.log(URL)
					
					
					// 执行查询
					_self.$axios({
						method: 'POST',
						url: URL,
						data: requestDataInIt,
						token: token,
					}).then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						// console.log(Result)
						// resolve(Result.rows)
						uni.$emit('getSelectItem', { ...Result.rows[0]});
					})
					
				// })
				
				
				
			
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
</style>

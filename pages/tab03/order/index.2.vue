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
					<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-if='item.ISVISIBLE==1'
					 v-for="(item,index) in configForm[TabCur]">
						<view class="title">
							<text class="text-red" v-if="item.ISREQUESTED==1">*</text>{{ item.DISPLAYNAME }}
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
							{{ formValue[TabCur][item.FIELDNAME] }}
						</view>
						<!-- v-model="formValue[TabCur][item.FIELDNAME]" -->
						<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
							<input type="text" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'"
							  @focus="setActive($event,index)" :value="formValue[TabCur][item.FIELDNAME]" @change="getValue($event,index)" :placeholder="'请输入'+ item.DISPLAYNAME" />
							<input type="number" @focus="setActive($event,index)" v-if="item.FIELDTYPE == 'number' || item.FIELDTYPE == 'decimal'"
							  @change="getValue($event,index)" :value="formValue[TabCur][item.FIELDNAME]" :placeholder="'请输入'+ item.DISPLAYNAME" />
						</view>
						<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(index)">
							{{ formValue[TabCur][item.FIELDNAME] }}
						</view>
						<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
							{{ formValue[TabCur][item.FIELDNAME] }}
						</view>

						<view class="flex-row-between myrow" v-if="item.CTRLTYPE == 'ExEnum' ">
							<picker @change="bindPickerChange($event,index)" :value="formValue[TabCur][item.FIELDNAME+'VI']" :range="formValue[TabCur][item.FIELDNAME+index]">
								<view> {{ formValue[TabCur][item.FIELDNAME+index][formValue[TabCur][item.FIELDNAME+'VI']] }} </view>
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
		queryUrl, submitUrl=[], page = 1,
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
			console.log(999);
			this.uniSkip.getParams(function(res) {
				token = res.token;
				_self.tabList = res.CHILDRENS;
				// console.log(JSON.stringify(res))
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
			getValue(e,i){
				 let val = e.target.value;
				 let id  = _self.configForm[_self.TabCur][i].FIELDNAME ;
				 _self.formValue[_self.TabCur][id] = val;
				// _self.list[i] = val;
			},
			tabSelect(e) {
				_self.TabCur = e ;
				// console.log(e);
				this.scrollLeft = (e - 1) * 60;
			},

			setActive(e,i) {
				_self.formActiveIndex = i;
			},
			// 日期确认
			onConfirm(val) {
				_self.formValue[_self.TabCur][_self.dateTimekey] = val.result;
			},
			bindPickerChange: function(e, n) {
				_self.formActiveIndex = n ;
				let val = e.target.value;
				let id = _self.configForm[_self.TabCur][n].FIELDNAME;
				console.log(val);
				_self.formValue[_self.TabCur][id+'VI'] = val;
				_self.formValue[_self.TabCur][id + 'List'].forEach((item, index) => {
					if (index == val) {
						return _self.formValue[_self.TabCur][id] = item.id ;
					}
				})
				
				let clearArr = _self.configForm[_self.TabCur][n].VMEMO.split(',');
				clearArr.forEach((itemc)=>{
					let tnt = itemc.split('=');
					_self.formValue[_self.TabCur][tnt[0]] = tnt[1] || '';
				})
				console.log(_self.formValue[_self.TabCur]);
			},
			initConfig(data) {
				// 初始化动态配置数据
				// console.log(JSON.stringify(data))
				let tabLength = data.length;
				_self.paddingTop = tabLength != 1 ? '45px' : '0';
				// _self.marterType = _self.tabList[_self.TabCur].CONFIGMODEL[0].VALUE //  0 单物料  1多物料
				if (tabLength == 1) {
					_self.paddingTop = 0;
					_self.marterType = _self.tabList[_self.TabCur].CONFIGMODEL[0].VALUE;
					_self.configForm = data[i].DYNAMICMODEL.Add;
				} else {
					let formconfig = [];
					for (let i = 0; i < tabLength; i++) {
						let itemA = data[i];
						formconfig.push(itemA.DYNAMICMODEL.Add);
						itemA.CHILDRENS.forEach((item)=>{
							if(item.ISFUNCTION == 3){
								submitUrl.push(item.INTERFACEURL)
							}
						})
						// type.push(item.CONFIGMODEL[0].VALUE)
					}
					// _self.marterType = type;
					_self.configForm = formconfig;
					_self.initForm(formconfig);
					console.log(JSON.stringify(_self.configForm))
					// console.log(_self.configForm);
				}

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
				if(ajaxParamsArr[3]){ 
					let jbl = ajaxParamsArr[3].split('=');
					if(! _self.formValue[_self.TabCur][jbl[1]] ){ // 获取上级数据id
						return uni.showToast({
							title:'上一级信息不能为空',
							icon: 'none'
						})
					}else{
						requestData[jbl[0]] = _self.formValue[_self.TabCur][jbl[1]]
					}
				}else if(e.VMEMO){ // 如果点击的时父级清除子集数据
					let clearArr = e.VMEMO.split(',');
					clearArr.forEach((itemc)=>{
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
				let data = _self.formValue[_self.TabCur];
				// data.userId = userId
				// let submitAjaxUrl = _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL ;
				// console.log(JSON.stringify(data));
				// console.log(token);
				// data.userId = userId
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
				
				let savedata =   _self.mainSubValue(_self.configForm[_self.TabCur],data);
				savedata.userId = userId
				// console.log(JSON.stringify(savedata));
				// console.log(baseUrl + submitUrl[_self.TabCur]);
				uni.showLoading({
					title:'提交中...'
				})
				uni.request({
					url: baseUrl + submitUrl[_self.TabCur],
					data: savedata,
					header: {
						Authorization: 'BasicAuth ' + token
					},
					method: "POST",
					success: function(res) {
						console.log(res);
						uni.hideLoading();
						if (res.data.IsSuccess && res.statusCode == 200) {
							uni.showToast({
								title: '提交成功',
								icon: 'none',
								duration: 1500
							});
							_self.initForm(_self.configForm);
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
				// console.log(JSON.stringify(data))
				let formValueArr = [];
				for(let i = 0; i < data.length; i++) {
					let _formValue = {};
					data[i].forEach((item, index) => {
						let tipText = '';
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
							// tipText = utils.resolveDate(item.DEFAULTVALUE); 取解析后的日期
							// tipText = item.DEFAULTVALUE;
							tipText = utils.resolveDate(item.DEFAULTVALUE);
							// console.log(tipText);
						} else if (item.CTRLTYPE == 'ExUpload') {
							_formValue['img' + index] = '';
						} else if (item.CTRLTYPE == 'ExEnum') {
							console.log('item.EXPESSION='+item.EXPESSION)
							// if(!item.EXPESSION){  _formValue[item.FIELDNAME] =''; return ;}
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
						_formValue[item.FIELDNAME] = tipText
					})
					formValueArr.push(_formValue) ;
					// _self.configForm = allconfig;
					// console.log(JSON.stringify(_formValue))
				} // 最外层循环结束
				// console.log(JSON.stringify(formValueArr))
				_self.formValue = formValueArr ;
			} ,
			mainSubValue(dataConfig,dataVal){ // 把值转换为主子表结构
				let submitData = {DTL:[]},detail={};
				dataConfig.forEach((item)=>{
					if (item.GROUPID.slice(-2) == '01') {
						submitData[item.FIELDNAME] = dataVal[item.FIELDNAME]
					}else{
						detail[item.FIELDNAME] = dataVal[item.FIELDNAME]
					}
				})
				submitData.DTL=[{...detail}];
				return submitData;				
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

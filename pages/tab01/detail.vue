<template>
	<!-- 一车多单 -->
	<view class="">
		<view class="card-wrapper">
			<!-- 主表 -->
			<view class="radius shadow shadow-lg padding-sm bg-white text-m">
				<view class="flex flex-wrap margin-xs myrow" v-for="(itemC,indexC) in mainTable" v-if="itemC.ISVISIBLE==1" :key="indexC">
					<view class="flex-sub position-r">
						<text class="text-red must-flag-left" v-if="itemC.ISREQUESTED==1">*</text>
						<text class="text-black text-m">{{ itemC.DISPLAYNAME }}： </text>
					</view>
					<view class="flex-twice text-black solid-bottom my-solid-bottom text-cut text-m" :class="inputIndex==indexC?'solid-bottom-blue':'' ">
						
						<view class="search-wrap" v-if="itemC.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(itemC,10001,indexC)">
							<input type="text" class="text-blue search-input text-m" v-model="mainTableValue[itemC.FIELDNAME]" :placeholder="'请选择'+ itemC.DEFAULTNAME"
							 disabled />
							<text class="cuIcon-search text-blue text-bold"></text>
						</view>
						
						<view class="search-wrap" v-if="itemC.CTRLTYPE == 'ExInputSearch' " >
							<input type="text" class="text-blue search-input text-m" v-model="mainTableValue[itemC.FIELDNAME]" :placeholder="'请输入或选择'+ itemC.DEFAULTNAME"
							  />
							<text class="cuIcon-search text-blue text-bold" @click="searchEvent(itemC,10001,indexC)"></text>
						</view>
						
						<!-- <view class="search-wrap" v-if="itemC.CTRLTYPE == 'ExSearchMatch' ">
							<input type="text" class="text-blue search-input" :value="mainTableValue[itemC.FIELDNAME]" :placeholder="'请选择'+ itemC.DEFAULTNAME"
							  />
							 <picker @change="bindPickerChangeTT" :value="index" :range="mytestRage">
							    <text class="cuIcon-unfold text-blue text-bold">
							    </text>
							 </picker>
						</view> -->

						<view class="text-gray" v-if="itemC.CTRLTYPE == 'ExReadCard' ">
							<input type="text" class="text-m" :value="mainTableValue[itemC.FIELDNAME]" disabled />
						</view>

						<view class="flex-row-between text-m" v-if="itemC.CTRLTYPE == 'ExTextBox' ">
							<input type="text" class="my-input text-m" @focus="setActive(indexC)" v-model="mainTableValue[itemC.FIELDNAME]" 
							 :placeholder="'请输入'+ itemC.DEFAULTNAME" />
							<text class="cuIcon-write text-blue text-bold"></text>
						</view>
						
						<view class="flex-row-between text-m" v-if="itemC.CTRLTYPE == 'ExNumber' ">
							<input type="number" class="my-input text-m" @focus="setActive(indexC)" v-model="mainTableValue[itemC.FIELDNAME]" 
							 :placeholder="'请输入'+ itemC.DEFAULTNAME" :maxlength="itemC.FIELDLENGTH" />
							<text class="cuIcon-write text-blue text-bold"></text>
						</view>

						<view class="flex-row-between myrow" v-if="itemC.CTRLTYPE == 'ExEnum' ">
							<picker @change="bindPickerChange($event,itemC.FIELDNAME,indexC)" 
							range-key="name"
							:value="mainTableValue[itemC.FIELDNAME+'VI']"
							 :range="mainTableValue[itemC.FIELDNAME+'List']">
								<view style="width: 100%;" class="text-m">   {{ mainTableValue[itemC.FIELDNAME+"List"][mainTableValue[itemC.FIELDNAME+'VI']].name }} </view>
							</picker>
							<text class="cuIcon-triangledownfill text-blue text-bold"></text>
						</view>

						<view class="cu-form-val text-blue flex-row-between text-m" v-if="itemC.CTRLTYPE == 'ExDateTime' " @click="dateEventM(itemC)">
							<text>{{ mainTableValue[itemC.FIELDNAME] || ''}}</text>
							<text class="cuIcon-calendar text-blue text-bold"></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 子表订单信息 -->
			<view class="radius shadow shadow-lg bg-white padding-sm margin-top sub-table" v-for="(item,index) in planOrder"
			 :key="index">

				<view class="flex flex-wrap margin-xs myrow" v-for="(itemC,indexC) in subTable" v-if="itemC.ISVISIBLE==1" :key="indexC">
					<view class="flex-sub position-r">
						<text class="text-red must-flag-left" v-if="itemC.ISREQUESTED==1">*</text>
						<text class="text-black text-m">{{ itemC.DISPLAYNAME || ''}}：</text>
					</view>
					<view class="flex-twice text-black text-m" :class="itemC.CTRLTYPE == 'ExReadCard'? '' :'my-solid-bottom' ">
						<view class="text-blue" v-if="itemC.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(itemC,index)">
							{{ item[itemC.FIELDNAME] || '请选择'+ itemC.DISPLAYNAME }}
						</view>

						<view class="text-gray myrow" v-if="itemC.CTRLTYPE == 'ExReadCard' ">
							{{ item[itemC.FIELDNAME] || '' }}
						</view>

						<view class="flex-row-between myrow" v-if="itemC.CTRLTYPE == 'ExTextBox' ">
							<input type="text" class="my-input text-m" v-model="item[itemC.FIELDNAME]" value="" :placeholder="'请输入'+ itemC.DEFAULTNAME" />
							<text class="cuIcon-write text-blue text-bold"></text>
						</view>
						
						<view class="flex-row-between myrow" v-if="itemC.CTRLTYPE == 'ExNumber' ">
							<input type="number" class="my-input text-m" @blur="resetPoint(index,itemC)"  v-model="item[itemC.FIELDNAME]" value="" :placeholder="'请输入'+ itemC.DEFAULTNAME" />
							<text class="cuIcon-write text-blue text-bold"></text>
						</view>

						<view class="flex-item-center upload-wrap" v-if="itemC.CTRLTYPE == 'ExUpload' ">
							<button class="cu-btn  round lines-blue  sm" @click="updateImg(index,itemC.FIELDNAME)">
								<text class="cuIcon-upload "></text>
								{{ item.imgurl ? '重传' : '上传' }}
							</button>
							<image style="width: 50px;height: 30px;padding-left: 10px;" :src="item.imgurl" @tap="previewImage(index,itemC.FIELDNAME)">
							</image>
						</view>

						<view class="cu-form-val text-blue flex-row-between  myrow" v-if="itemC.CTRLTYPE == 'ExDateTime' " @click="dateEvent(index,itemC.FIELDNAME)">
							<text> {{ item[itemC.FIELDNAME] || ''}} </text>
							<text class="cuIcon-calendar text-blue text-bold"></text>
						</view>
					</view>

					<button class="cu-btn cuIcon bg-red sm remove-btn" @click="removeItem(index)" v-if="sendCarType != 0">
						<text class="cuIcon-move"></text>
					</button>
					<view class="tag-left-wrap text-white">

					</view>
					<view class="tag-text">
						{{ index +1 }}
					</view>
				</view>

			</view>



			<view class="" @click="submitForm">
				<button class="cu-btn block bg-blue margin-tb-sm lg" :disabled="isDisabled" :loading="isDisabled">
					提交
				</button>
			</view>


			<view class="add-btn-wrap" @click="addItem" v-if="sendCarType != 0">
				<button class="cu-btn cuIcon bg-green lg shadow-blur">
					<text class="cuIcon-add"></text>
				</button>
			</view>

		</view>
		<!-- <w-picker mode="dateTime" startYear="2000" endYear="2050" step="1" :defaultVal="[1,1,1,1,2,5]" :current="true"
		 @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker> -->

		<w-picker mode="date" startYear="2000" endYear="2050" :current="true" :fields="FieldType" @confirm="onConfirm($event,'date')"
		 :disabled-after="false" ref="dateTime"></w-picker>

	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import utils from "@/common/util.js"
	import wPicker from "@/components/w-picker-v2/w-picker.vue";
	var graceChecker = require("@/common/graceChecker.js");
	let _self, baseUrl, myToken, token, voluationJson, userId, saveUrl, removeList = [];

	export default {
		data() {
			return {
				planOrder: '',
				config: '',
				FieldType: 'minute', // 时间控件颗粒度
				sendCarType: 0,
				mainTable: [], // 主表配置
				mainTableValue: {},
				subTable: [], // 子表配置
				subValueList: [],
				subCur: 0, // 当前激活的子表 下标
				activeId: '',
				protocol: '', // 是否启用协议
				protocolMain: '', // 协议内容
				protocolUrl: '', // 协议地址 
				inputIndex: '', // 主表
				isDisabled: false,
				mytestRage:['京A12345', '京A12345', '京A12345', '京A12345'],
				
			}
		},
		components: {
			wPicker
		},
		computed: mapState(['addCarInfo', 'selectItem']), // 取store 中的数据
		onLoad(params) {
			_self = this;
			baseUrl = params.baseUrl
			userId = params.userId
			this.sendCarType = params.sendCarType
			uni.setNavigationBarTitle({
				title: params.title
			});
			// console.log(JSON.stringify(params));
			this.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				saveUrl = baseUrl + data.submitUrl
				token = data.token
				// console.log(token);
				_self.planOrder = data.list.map((item) => {
					item.imgurl = '';
					return item;
				})
				_self.initConfig(data.addCFG)
			})
		},
		onShow() {
			removeList = [];
			uni.$on('getSelectItem', (info) => {
				// console.log(info);
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				let myitem = _self.planOrder[_self.subCur] ;
				// console.log('_self.subCur='+_self.subCur);
				// console.log(myitem);
				if (_self.subCur == 10001) {
					myitem = _self.mainTableValue
				}
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					myitem[tntKey] = info[tntVal]
				})
			})
		},
		onUnload() {
			// 移除监听事件  
			uni.$off('getSelectItem');
		},
		//  点击左上角返回事件
		onBackPress(options) {
			if (options.from === 'navigateBack') {
				return false;
			}
			_self.addItem();
			return true;
		},
		methods: {
			...mapMutations(['addCarReduce']), // 引入 store 中的reduce方法
			
			bindPickerChangeTT(e){
				console.log('picker发送选择改变，携带值为', e.target.value)
			},
			
			initConfig(add) {
				let mainTbaleA = [],
					sunTableA = [],
					mainForm = {},
					subForm = [];
				add.forEach((item, index) => {
					if (item.GROUPID.slice(-2) == '01') {
						mainTbaleA.push(item)
						if (item.DEFAULTVALUE == '0') {
							mainForm[item.FIELDNAME] = 0;
						} else {
							mainForm[item.FIELDNAME] = item.DEFAULTVALUE || '';
						}
						// if (item.CTRLTYPE == 'ExSearchMatch') {
						// 	mainForm[item.FIELDNAME] = '';
						// } else 
						if (item.CTRLTYPE == 'ExDateTime') {
							mainForm[item.FIELDNAME] = item.DEFAULTVALUE ?
							(item.EXPESSION =='minute' ?   utils.resolveDate(item.DEFAULTVALUE)+' 00:00:00' : utils.resolveDate(item.DEFAULTVALUE)  )
							 : utils.getToDay();
						} else if (item.CTRLTYPE == 'ExAgreement') { // 协议
							_self.protocol = item.ISVISIBLE
						} else if (item.CTRLTYPE == 'ExEditor') { // 协议内容
							_self.protocolUrl = item.EXPESSION.split('|')[1] || '';
							console.log(_self.protocolUrl);
						} else if (item.CTRLTYPE == 'ExEnum') {
							// console.log(item);
							let str = item.EXPESSION.split('|');
							let arr = utils.strToArray(str[1]);
							let val = item.DEFAULTVALUE,
								valIndex = 0;
							// console.log(JSON.stringify(arr));
							// console.log(index);
							arr.forEach((item, index) => {
								if (item.id == val) {
									valIndex = index
									return null;
								}
							})
							let arrlist = item.FIELDNAME + index;
							mainForm[arrlist] = arr.map((item) => {
								return item.name
							});
							mainForm[item.FIELDNAME] = val;
							mainForm[item.FIELDNAME + 'VI'] = valIndex
							mainForm[item.FIELDNAME + 'List'] = arr
						}
					} else if (item.GROUPID.slice(-2) == '02') {
						sunTableA.push(item)
					}
				})
				_self.mainTable = mainTbaleA
				_self.mainTableValue = mainForm
				_self.subTable = sunTableA
				_self.maoCheckPlan();
				// _self.subForm = subForm
				// console.log(JSON.stringify(_self.mainTableValue));
				// console.log(JSON.stringify(sunTableA));
			},

			dateEvent(e, id) {
				_self.subCur = e;
				_self.activeId = id;
				this.$refs.dateTime.show();
			},

			dateEventM(CF) {
				_self.subCur = 'M'
				_self.activeId = CF.FIELDNAME;
				this.FieldType = CF.EXPESSION
				this.$refs.dateTime.show();
			},

			onConfirm(val) {
				if (_self.subCur == 'M') {
					_self.mainTableValue[_self.activeId] = val.result
				} else {
					_self.planOrder[_self.subCur][_self.activeId] = val.result;
				}
			},
			setActive(i) {
				_self.inputIndex = i
			},
			bindPickerChange: function(e, id, n) {
				_self.inputIndex = n
				let val = e.target.value;
				_self.mainTableValue[id + 'VI'] = val;
				_self.mainTableValue[id + 'List'].forEach((item, index) => {
					if (index == val) {
						return _self.mainTableValue[id] = item.id;
					}
				})
			},

			removeItem(i) {
				// console.log(i);
				if (i == 0 && _self.planOrder.length == 1) {
					return uni.showToast({
						title: '最后一个不可删除',
						icon: "none"
					});
				}
				removeList.push(_self.planOrder[i].indexNum)
				_self.planOrder.splice(i, 1)
			},
			searchEvent: function(e, index, activeNo) {
				_self.inputIndex = activeNo || ''
				console.log(activeNo);
				_self.subCur = index;
				// console.log(index);
				let ajaxUrlArray = e.EXPESSION.split('|');
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : ''
				// console.log(baseUrl);
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
				// console.log(JSON.stringify(ajaxParamsArr));
				// console.log(JSON.stringify(requestData));
				// console.log(JSON.stringify(voluationJson));
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
			getSelectItem() {
				let info = _self.selectItem;
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				// console.log(voluationJsonArr);
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					_self.subValueList[_self.subCur][tntKey] = info[tntVal]
				})
			},
			submitForm() {
				let rule = utils.getRules(_self.mainTable);
				let data = _self.mainTableValue;
				// console.log(rule);
				// console.log(data);
				let checkRes = graceChecker.check(data, rule);
				// console.log(checkRes,graceChecker);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				let rulesub = utils.getRules(_self.subTable);
				let datasub = _self.planOrder;
				// console.log(JSON.stringify(rulesub));
				// console.log(JSON.stringify(datasub));
				let checkRes2 = true,
					errIndex = '',
					errortext = '';
				datasub.forEach((item, index) => {
					let mycheckRes = graceChecker.check(item, rulesub);
					console.log(mycheckRes);
					if (!mycheckRes) {
						checkRes2 = false
						return uni.showToast({
							title: `请检查订单的 ${graceChecker.error}`,
							icon: "none"
						});
					} else {
						checkRes2 = true
					}
				})

				if (checkRes2 == false) {
					return;
				}
				setTimeout(function() {
					uni.hideLoading();
				}, 5000);

				let subData = _self.planOrder;
				// _self.mainTableValue.PHONEMAC = plus.device.imei || plus.device.imsi
				// _self.mainTableValue.PHONEvendor = plus.device.vendor || ''
				// _self.mainTableValue.PHONEmodel = plus.device.model || ''
				// let saveData = [{ ..._self.mainTableValue,
				// 	details: subData
				// }]
				let saveData = { ..._self.mainTableValue,
					// ASSIGNPLAN_DTLS:  subData  ,
					details: subData
				}
				
				// let saveData = [{ ..._self.mainTableValue,
				// 	ASSIGNPLAN_DTLS:  JSON.stringify(subData)  ,
				// 	details: JSON.stringify(subData)
				// ]
				console.log(saveUrl);
				console.log([saveData]);
				let params = {
					method: 'POST',
					url: saveUrl,
					data:  JSON.stringify([saveData]),
					token: token,
					isLoading: true
				}
				_self.isDisabled = true
				_self.$axios(params)
					.then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						_self.isDisabled = false
						// console.log('封装的方法',res);
						_self.clearCheck();
						_self.$utils.tips('成功：' + Message, 3000)
						setTimeout(function() {
							uni.navigateBack({})
						}, 3000 )
					})
					.catch(e => {
						console.log(e);
						_self.isDisabled = false
					})

				// console.log(saveUrl);
				// console.log(JSON.stringify(saveData));
				// uni.request({
				// 	url: saveUrl,
				// 	data: JSON.stringify(saveData),
				// 	header: {
				// 		Authorization: 'BasicAuth ' + token
				// 	},
				// 	method: "POST",
				// 	success: function(res) {
				// 		console.log(res);
				// 		uni.hideLoading();
				// 		if (res.data.IsSuccess && res.statusCode == 200) {
				// 			uni.showToast({
				// 				title: '提交成功',
				// 				icon: 'none',
				// 				duration: 1500
				// 			});
				// 			_self.clearCheck();
				// 			setTimeout(function() {
				// 				uni.navigateBack({})
				// 			}, 1600)
				// 		} else {
				// 			uni.showToast({
				// 				title: '提交失败:' + res.data.Message,
				// 				icon: 'none',
				// 				duration: 2000
				// 			});
				// 		}
				// 	},
				// 	error: function(error) {
				// 		uni.hideLoading();
				// 		uni.showToast({
				// 			title: '提交失败:' + res.data.Message,
				// 			icon: 'none',
				// 			duration: 2000
				// 		});
				// 	}

				// })
			},

			updateImg(e, id) {
				// console.log(e, id);
				uni.chooseImage({
					count: 1,
					success: (chooseImageRes) => {
						const tempFilePaths = chooseImageRes.tempFilePaths;
						// console.log(tempFilePaths);
						uni.uploadFile({
							url: baseUrl + '/api/Common/Upload',
							filePath: tempFilePaths[0],
							name: 'file',
							header: {
								Authorization: 'BasicAuth ' + token
							},
							formData: {
								'userId': userId
							},
							success: (uploadFileRes) => {

								let res = JSON.parse(uploadFileRes.data)
								if (uploadFileRes.statusCode == 200) {
									// let imgUrlArr = uploadFileRes.data.Result;
									// console.log(res);
									let imgUrlStr = '';
									res.Result.forEach((item) => {
										imgUrlStr = item + '&';
									})
									// console.log(imgUrlStr);
									_self.planOrder[e][id] = imgUrlStr;
									_self.planOrder[e].imgurl = tempFilePaths;
									// _self.$set(_self.planOrder[e], 'imgurl', tempFilePaths);
									// console.log(_self.planOrder[e].imgurl);
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
			},
			previewImage(e, id) {
				var imageList = _self.planOrder[e].imgurl
				console.log(imageList);
				uni.previewImage({
					current: 0,
					urls: imageList
				})
			},

			addItem() {
				uni.$emit('removeItemDCW', removeList);
				this.uniSkip.navigateBack({
					data: {},
				});
			},
			// 检查计划单中是否存在子表的key ,valuie
			maoCheckPlan() {
				let subconfig = _self.subTable;
				let planOrders = _self.planOrder;

				let newPlanorder = planOrders.map((item, index) => {
					subconfig.forEach((itemC, indexC) => {
						let key = itemC.FIELDNAME;
						if (!item[key]) {
							item[key] = '';
						}
					})
					return item;
				})
				_self.planOrder = newPlanorder;
				// console.log(JSON.stringify(newPlanorder));
			},
			// 提交成功后执行该方法
			clearCheck() {

				_self.planOrder.forEach((item) => {
					removeList.push(item.indexNum)
				})
				uni.$emit('removeItemDCW', removeList);
			},
			// 控制小数位数
			resetPoint(i,cfg){
				let id = cfg.FIELDNAME,
				  Point = cfg.DECIMALPOINT;
				if (Point == "") return;
				Point = Point * 1;
				let a = this.planOrder[i][id] * 1;
				let p = isNaN(parseInt(Point)) ? 0 : parseInt(Point);
				let v = a.toFixed(p);
				this.planOrder[i][id] = v;
				this.$forceUpdate()
				// console.log(55, this.planOrder[i][id]);
			}
			
		}
	}
</script>

<style scoped>
	.card-wrapper {
		padding: 26upx;
	}
	
	.text-m{
		font-size: 36rpx!important;
	}

	.myrow {
		min-height: 60rpx;
	}

	.my-solid-bottom {
		height: 50upx;
		border-bottom: 1upx solid rgba(0, 0, 0, 0.15);
	}

	.flex-wrap {
		align-items: center;
	}

	.add-btn-wrap {
		position: fixed;
		right: 50upx;
		bottom: 60upx;
	}

	.add-btn-wrap .cuIcon-add {
		font-size: 70upx;
	}

	.sub-table {
		position: relative;
	}

	.remove-btn {
		position: absolute;
		right: 20upx;
		top: 10upx;
	}

	.cuIcon-move {
		font-size: 40upx;
	}

	.search-wrap {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.search-wrap input {
		width: 90%;
	}

	.upload-wrap {
		position: relative;
		top: -10upx;
	}

	.tag-left-wrap {
		position: absolute;
		left: 0;
		top: 0;
		border-top: 30upx solid #0164FF;
		border-right: 15upx solid #0164FF;
		border-bottom: 10upx solid #fff;
		border-left: 15upx solid #0164FF;
	}

	.tag-text {
		position: absolute;
		left: 0upx;
		top: 5upx;
		color: #fff;
		font-size: 20upx;
		text-align: center;
		width: 30upx;
	}

	.must-flag-left {
		position: absolute;
		left: -16upx;
	}

	.search-input {
		width: 100%;
	}
</style>

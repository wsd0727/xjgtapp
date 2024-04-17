<template>
	<!-- 一车多单 -->
	<view class="">
		<view class="card-wrapper">
			<!-- 主表 -->
			<view class="radius shadow shadow-lg padding-sm bg-white">
				<view class="flex flex-wrap margin-xs myrow" v-for="(itemC,indexC) in mainTable" v-if="itemC.ISVISIBLE==1" :key="indexC">
					<view class="flex-sub position-r text-m">
						<text class="text-red must-flag-left" v-if="itemC.ISREQUESTED==1">*</text>
						<text class="text-black">{{ itemC.DISPLAYNAME }}： </text>
					</view>
					<view class="flex-twice text-black solid-bottom my-solid-bottom text-cut text-m" :class="inputIndex==indexC?'solid-bottom-blue':'' ">
						<view class="search-wrap" v-if="itemC.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(itemC,10001,indexC)">
							<!-- <input type="text" class="text-blue search-input"  :value="mainTableValue[itemC.FIELDNAME]"
							 :placeholder="'请选择'+ itemC.DEFAULTNAME" disabled /> -->
							<view class="value-box">
								{{ mainTableValue[itemC.FIELDNAME] || '请选择'+ itemC.DEFAULTNAME }}
							</view> 
							<text class="cuIcon-search text-blue text-bold"></text>
						</view>

						<view class="text-gray text-m" v-if="itemC.CTRLTYPE == 'ExReadCard' ">
							<!-- {{ mainTableValue[itemC.FIELDNAME] || '' }} -->
							<input type="text" :value="mainTableValue[itemC.FIELDNAME]" disabled />
						</view>

						<view class="flex-row-between" v-if="itemC.CTRLTYPE == 'ExTextBox' ">
							<input type="text" class="my-input text-m" @focus="setActive(indexC)" v-model="mainTableValue[itemC.FIELDNAME]" value=""
							 :placeholder="'请输入'+ itemC.DEFAULTNAME" />
							<text class="cuIcon-write text-blue text-bold"></text>
						</view>

						<view class="flex-row-between myrow" v-if="itemC.CTRLTYPE == 'ExEnum' ">
							<picker @change="bindPickerChange($event,itemC.FIELDNAME,indexC)" :value="mainTableValue[itemC.FIELDNAME+'VI']"
							 :range="mainTableValue[itemC.FIELDNAME+indexC]">
								<view> {{ mainTableValue[itemC.FIELDNAME+indexC][mainTableValue[itemC.FIELDNAME+'VI']] }} </view>
							</picker>
							<text class="cuIcon-triangledownfill text-blue text-bold"></text>
						</view>

						<view class="cu-form-val text-blue flex-row-between" v-if="itemC.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item)">
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
						<text class="text-black">22{{ itemC.DISPLAYNAME || ''}}：</text>
					</view>
					<view class="flex-twice text-black text-m" :class="itemC.CTRLTYPE == 'ExReadCard'? '' :'my-solid-bottom' ">
						<view class="text-blue" v-if="itemC.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(itemC,index)">
							{{ item[itemC.FIELDNAME] || '' }}
						</view>

						<view class="text-gray text-m myrow" v-if="itemC.CTRLTYPE == 'ExReadCard' ">
							{{ item[itemC.FIELDNAME] || '' }}--
						</view>

						<view class="flex-row-between myrow text-m" v-if="itemC.CTRLTYPE == 'ExTextBox' ">
							<input type="text" class="my-input text-m" v-model="item[itemC.FIELDNAME]" value="" :placeholder="'请输入22'+ itemC.DEFAULTNAME" />
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

					<button class="cu-btn cuIcon bg-red sm remove-btn" @click="removeItem(index)">
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
				<button class="cu-btn block bg-blue margin-tb-sm lg" 
				:disabled="isDisabled"
				:loading="isDisabled"
				>
					提交
				</button>
			</view>


			<view class="add-btn-wrap" @click="addItem">
				<button class="cu-btn cuIcon bg-green lg shadow-blur">
					<text class="cuIcon-add"></text>
				</button>
			</view>

		</view>
		<w-picker mode="dateTime" startYear="2000" endYear="2050" step="1" :defaultVal="[1,1,1,1,2,5]" :current="true"
		 @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import utils from "@/common/util.js"
	import wPicker from "@/components/w-picker/w-picker.vue";
	var graceChecker = require("@/common/graceChecker.js");
	let _self, baseUrl, myToken, token, voluationJson, userId, saveUrl, removeList = [];
	// 0 一车一单  1 一车多单    2多车一单
	export default {
		data() {
			return {
				planOrder: '',
				config: '',
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
				isDisabled : false
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
			console.log(JSON.stringify(params));
			this.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				saveUrl = baseUrl + data.submitUrl
				token = data.token
				console.log(_self.sendCarType);
				if( _self.sendCarType < 2){
					_self.planOrder = data.items 
				}
				_self.initConfig(data.addCFG)
			})
		},
		onShow() {
			removeList = [];
			uni.$on('getSelectItem', (info) => {
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				let myitem = _self.subValueList[_self.subCur]
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
			initConfig(add) {
				let mainTbaleA = [],
					sunTableA = [],
					mainForm = {},
					subForm = [];
				add.forEach((item, index) => {
					if (item.GROUPID.slice(-2) == '01') {
						mainTbaleA.push(item)
						mainForm[item.FIELDNAME] = item.DEFAULTVALUE || '' ;
						
					} else if (item.GROUPID.slice(-2) == '02') {
						sunTableA.push(item)
					}
				})
				_self.mainTable = mainTbaleA
				_self.mainTableValue = mainForm
				_self.subTable = sunTableA
				_self.maoCheckPlan();
				// _self.subForm = subForm
				// console.log(JSON.stringify(mainTbaleA));
				// console.log(JSON.stringify(sunTableA));
			},
			
			
			getFormVal(item){
				// let val = ' 
				if (item.CTRLTYPE == 'ExDateTime') {
					mainForm[item.FIELDNAME] = item.DEFAULTVALUE? utils.resolveDate(item.DEFAULTVALUE) : utils.getToDay();
				} else if (item.CTRLTYPE == 'ExAgreement') { // 协议
					_self.protocol = item.ISVISIBLE
				} else if (item.CTRLTYPE == 'ExEditor') { // 协议内容
					_self.protocolUrl = item.EXPESSION.split('|')[1] || '';
					// console.log(_self.protocolUrl);
				} else if (item.CTRLTYPE == 'ExEnum') {
					let str = item.EXPESSION.split('|');
					let arr = utils.strToArray(str[1]);
					let val = item.DEFAULTVALUE,
						valIndex = 0;
					// console.log(JSON.stringify(arr));
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
			},

			dateEvent(e, id) {
				_self.subCur = e;
				_self.activeId = id;
				this.$refs.dateTime.show();
			},
			onConfirm(val) {
				// console.log(val);
				_self.planOrder[_self.subCur][_self.activeId] = val.result;
			},
			setActive(i) {
				console.log(i);
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
				// console.log(activeNo);
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

				let checkRes = graceChecker.check(data, rule);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				_self.isDisabled = true 
				let rulesub = utils.getRules(_self.subTable);
				let datasub = _self.planOrder;
				console.log(JSON.stringify(rulesub));
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
				_self.mainTableValue.PHONEMAC = plus.device.imei || plus.device.imsi 
				_self.mainTableValue.PHONEvendor = plus.device.vendor || ''
				_self.mainTableValue.PHONEmodel = plus.device.model || ''
				let saveData = [{ ..._self.mainTableValue,
					details: subData
				}]
				console.log(saveData);
				let params = {
					method: 'POST',
					url: saveUrl,
					data: JSON.stringify(saveData),
					token: token,
					isLoading: true
				}
				_self.$axios(params)
					.then(res => {
						let { IsSuccess, Result, Message } = res;
						_self.isDisabled = false
						// console.log('封装的方法');
						_self.clearCheck();
						_self.$utils.tips('成功：' + Message,3000)
						setTimeout(function() {
							uni.navigateBack({})
						}, 3200)
					})
					.catch(e=>{
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
			}
		}
	}
</script>

<style scoped>
	.card-wrapper {
		padding: 26upx;
	}

	.myrow {
		line-height: 50rpx;
		min-height: 60rpx;
		margin: 15rpx 0;
	}

	.my-solid-bottom {
		background-color: aquamarine;
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

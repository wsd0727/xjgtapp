<template>
	<!-- 一单一车  一单多车 的公用组件 -->
	<view class="">

		<view class="card-wrapper">
			<!-- 主表 -->
			<view class="bg-blue main-table-box">
				<view class="radius shadow shadow-lg padding-sm bg-white width710">
					<view class="flex flex-wrap margin-xs myrow" v-for="(itemC,indexC) in mainTable" v-if="itemC.ISVISIBLE==1" :key="indexC">
						<view class="flex-sub text-black ">
							{{ itemC.DISPLAYNAME }}：
						</view>
						<view class="flex-twice text-grey myrow text-cut">
							{{ setFormat(itemC.EXPESSION,planOrder[itemC.FIELDNAME],planOrder) }}
						</view>
					</view>
					<view class="me-line-gray">

					</view>
				</view>
			</view>

			<!-- 子表车辆司机信息 -->
			<view class="sub-table-box">

				<view class="radius bg-white padding-sm sub-table bottom-shadow" v-for="(item,index) in subValueList" :key="index">
					<text class="round-left"></text>
					<view class="flex flex-wrap margin-xs myrow" v-for="(itemC,indexC) in subTable" v-if="itemC.ISVISIBLE==1" :key="indexC">
						<view class="flex-sub">
							<text class="text-red must-flag" v-if="itemC.ISREQUESTED==1">*</text>
							<text class="text-black">{{ itemC.DISPLAYNAME }}： </text>
						</view>
						<view class="flex-twice text-black" :class="itemC.CTRLTYPE != 'ExReadCard' ?'solid-bottom':'' ">
							<view class="flex-row-between" v-if="itemC.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(itemC,index)">
								<input type="text" class="text-blue search-input" :value="item[itemC.FIELDNAME]" :placeholder="'请选择'+ itemC.DEFAULTNAME"
								 disabled />
								<text class="cuIcon-search text-blue text-bold"></text>
							</view>

							<view class="" v-if="itemC.CTRLTYPE == 'ExReadCard' ">
								{{ item[itemC.FIELDNAME] || '' }}
							</view>

							<view class="flex-row-between myrow" v-if="itemC.CTRLTYPE == 'ExEnum' ">
								<picker @change="bindPickerChange($event,itemC.FIELDNAME,index)" :value="item[itemC.FIELDNAME+'VI']" :range="item[itemC.FIELDNAME+'List']"
								 range-key="name">
									<view> {{ item[itemC.FIELDNAME+'List'][item[itemC.FIELDNAME+'VI']].name }} </view>
								</picker>
								<text class="cuIcon-triangledownfill text-blue text-bold"></text>
							</view>

							<view class="flex-row-between" v-if="itemC.CTRLTYPE == 'ExNumber' ">
								<input type="number" class="my-input" v-model="item[itemC.FIELDNAME]" value="" :placeholder="'请输入'+ itemC.DEFAULTNAME" />
								<text class="dicon diconbianjishuru-xianxing text-blue"></text>
							</view>

							<view class="flex-row-between" v-if="itemC.CTRLTYPE == 'ExTextBox' ">
								<input type="text" class="my-input" v-model="item[itemC.FIELDNAME]" value="" :placeholder="'请输入'+ itemC.DEFAULTNAME" />
								<text class="dicon diconbianjishuru-xianxing text-blue"></text>
							</view>

							<view class="cu-form-val text-blue" v-if="itemC.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item)">
								{{ item[itemC.FIELDNAME] || '' }}
							</view>
						</view>

						<button class="cu-btn cuIcon bg-red sm remove-btn" @click="removeItem(index)" v-if="sendCarType==2">
							<text class="cuIcon-move"></text>
						</button>

						<view class="tag-left-wrap text-white bg-blue">
							{{ index+1 }}
						</view>

						<text class="round-right"></text>
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
			</view>
			<view class="add-btn-wrap" @click="handleAdd" v-if="sendCarType==2">
				<button class="cu-btn cuIcon bg-green lg shadow-blur">
					<text class="cuIcon-add"></text>
				</button>
			</view>

		</view>



	</view>



</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import utils from "@/common/util.js"
	var graceChecker = require("@/common/graceChecker.js");
	let _self, baseUrl, myToken, token, voluationJson, userId, saveUrl, oneSubTable = {};
	
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
				subCur: 0 , // 当前激活的子表 下标
				isDisabled : false
			}
		},
		computed: mapState(['addCarInfo', 'selectItem']), // 取store 中的数据
		onLoad(params) {
			_self = this;
			baseUrl = params.baseUrl
			userId = params.userId
			_self.sendCarType = params.sendCarType
			uni.setNavigationBarTitle({
				title: params.title
			});
			console.log(JSON.stringify(params));
			this.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				saveUrl = data.ajaxUrl
				token = data.token
				_self.planOrder = data.items
				_self.initConfig(data.config)
			})
		},
		onShow() {
			uni.$on('getSelectItem', (info) => {
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				let myitem = _self.subValueList[_self.subCur]
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
		methods: {
			...mapMutations(['addCarReduce']), // 引入 store 中的reduce方法
			setFormat(a, b, c) {
				return utils.setFormat(a, b, c);
			},
			bindPickerChange: function(e, id, n) {
				let val = e.target.value;
				_self.subValueList[n][id + 'VI'] = val;
				// console.log(e, id, n);
				_self.subValueList[n][id + 'List'].forEach((item, index) => {
					if (index == val) {
						return _self.subValueList[n][id] = item.id;
					}
				})
			},
			initConfig(add) {
				/********** 特殊情况说明
				 * 在一单多车,一单一车里面,PCD00001 为子表,
				 ********* */
				let mainTbaleA = [],
					subTableA = [];
				add.forEach((item, index) => {
					if (item.GROUPID.slice(-2) == '02') {
						subTableA.push(item)
						// 子表数据默认值
						if(item.DEFAULTVALUE=='0') {
							oneSubTable[item.FIELDNAME] = 0;
						}else{
							oneSubTable[item.FIELDNAME] = item.DEFAULTVALUE || '' ;
						}
						// oneSubTable[item.FIELDNAME] = item.DEFAULTVALUE || '';
						// if (item.CTRLTYPE == 'ExSearchMatch') {
						// 	oneSubTable[item.FIELDNAME] = '';
						// } else 
						if (item.CTRLTYPE == 'ExDateTime') {
							oneSubTable[item.FIELDNAME] = utils.getToDay();
						} else if (item.CTRLTYPE == 'ExEnum') {
							let str = item.EXPESSION.split('|');
							let arr = utils.strToArray(str[1]);
							let val = item.DEFAULTVALUE,
								valIndex = 0;
							// console.log(JSON.stringify(arr));
							arr.forEach((item, indexT) => {
								if (item.id == val) {
									valIndex = indexT
									return null;
								}
							})
							let arrlist = item.FIELDNAME + index;
							oneSubTable[arrlist] = arr.map((item) => {
								return item.name
							});
							oneSubTable[item.FIELDNAME] = val || 0;
							oneSubTable[item.FIELDNAME + 'VI'] = valIndex
							oneSubTable[item.FIELDNAME + 'List'] = arr
						}
					} else {
						mainTbaleA.push(item)
					}
				})
				_self.mainTable = mainTbaleA
				_self.subTable = subTableA
				_self.$set(_self.subValueList, 0, _self.newOneSubTb(oneSubTable));
				// console.log(JSON.stringify(mainTbaleA));
				// console.log(JSON.stringify(subTableA));
				// console.log(JSON.stringify(_self.subValueList));
			},
			newOneSubTb(oneSubTable) { // 深度拷贝oneSubTable
				var result = {};
				for (let k in oneSubTable) {
					result[k] = oneSubTable[k]
				}
				return result;
			},
			handleAdd() {
				let rule = utils.getRules(_self.subTable);
				let data = _self.subValueList[_self.subValueList.length - 1];
				let checkRes = graceChecker.check(data, rule);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				_self.subValueList.push(_self.newOneSubTb(oneSubTable))
			},
			removeItem(i) {
				// console.log(i);
				if (i == 0 && _self.subValueList.length == 1) {
					return uni.showToast({
						title: '最后一个不可删除',
						icon: "none"
					});
				}
				_self.subValueList.splice(i, 1)
			},
			searchEvent: function(e, index) {
				_self.subCur = index;
				// console.log(index);
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
				// console.log(JSON.stringify(ajaxUrl));
				// console.log(JSON.stringify(_self.planOrder));
				// console.log(JSON.stringify(ajaxParamsArr));
				// console.log(JSON.stringify(requestData));
				// console.log(JSON.stringify(voluationJson));
				// 做级联判断 ，如果存在第四个
				if (ajaxParamsArr[3]) {
					let jbl = ajaxParamsArr[3].split('=');
					if (!_self.planOrder[jbl[1]]) { // 获取上级数据id
						return uni.showToast({
							title: '上一级信息不能为空',
							icon: 'none'
						})
					} else {
						requestData[jbl[0]] = _self.planOrder[jbl[1]]
					}
				}
				 
				voluationJson = ajaxParamsArr[2]
				
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
				let rule = utils.getRules(_self.subTable);
				let data = _self.subValueList[_self.subValueList.length - 1];
				// console.log(JSON.stringify(rule));
				// console.log(data);
				let checkRes = graceChecker.check(data, rule);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				_self.isDisabled = true 
				setTimeout(function() {
					uni.hideLoading();
				}, 10000);

				let subData = _self.subValueList;
				_self.planOrder.PHONEMAC = plus.device.imei || plus.device.imsi
				_self.planOrder.PHONEvendor = plus.device.vendor || ''
				_self.planOrder.PHONEmodel = plus.device.model || ''
				// console.log(_self.planOrder);
				let saveData = subData.map((item, index) => {
					item.details = [_self.planOrder]
					item.PHONEMAC = plus.device.imei || plus.device.imsi || ''
					item.PHONEvendor = plus.device.vendor || ''
					item.PHONEmodel = plus.device.model || ''
					return item;
				})
				// console.log(saveUrl);
				// console.log(JSON.stringify(saveData));
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
						_self.$utils.tips('成功：' + Message,3500)
						setTimeout(function() {
							uni.navigateBack({})
						}, 3600)
					})
					.catch(e=>{
						_self.isDisabled = false
					})
			}
		}
	}
</script>

<style scoped>
	.card-wrapper {
		/* padding: 26upx; */
	}

	.width710 {
		width: 710upx;
	}

	.main-table-box {
		width: 750upx;
		padding: 0upx 20upx;
		background-color: #0164FF;
	}

	.myrow {
		height: 50upx;
		line-height: 50upx;
		/* border-bottom: 1px solid #aaa; */
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
		margin-bottom: 20upx;
	}

	.remove-btn {
		position: absolute;
		right: 20upx;
		top: 10upx;
	}

	.tag-left-wrap {
		position: absolute;
		left: 0;
		top: 0;
		height: 20upx;
		text-align: center;
		border-radius: 8upx;
		border-bottom: 5px solid #fff;
		border-left: 0;
	}

	.cuIcon-move {
		font-size: 40upx;
	}

	.sub-table-box {
		width: 709upx;
		margin: 0 20upx;
	}

	.sub-table-box .sub-table:first-child {
		/* border-top: 1upx solid rgba(0,0,0,0.1); */
		top: -20upx;
	}

	.me-line-gray {
		height: 1upx;
		width: 100%;
		margin: 20upx 0;
		background-color: rgba(0, 0, 0, .2);
	}

	.round-right {
		position: absolute;
		top: 49%;
		right: -15upx;
		width: 30upx;
		height: 30upx;
		border-radius: 15upx;
		background-color: #f1f1f1;
	}

	.round-left {
		position: absolute;
		top: 49%;
		left: -15upx;
		width: 30upx;
		height: 30upx;
		border-radius: 15upx;
		background-color: #f1f1f1;
	}
</style>

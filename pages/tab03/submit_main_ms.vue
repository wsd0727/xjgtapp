<template>
	<!-- 主子表结构   -->
	<view class="">
		<!-- 主表 -->
		<view class="main-wrap">
			<view class="title-wrap">
				车辆信息
			</view>
			<view class="main-content bg-white">
				<view class="content-row" v-for="(item,index) in configFormMain" v-if="item.ISVISIBLE==1">
					<view class="row-label" :class="item.ISREQUESTED?'must-flag': '' ">
						{{ item.DISPLAYNAME }}
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,'M')">
						<!-- {{ formValue[item.FIELDNAME] }} -->
						<!-- <input class="text-blue" type="text" disabled :value="formValue[item.FIELDNAME]" /> -->
						<view class="input-box">
							{{ formValue[item.FIELDNAME] }}
						</view>
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExTextBox' ">
						<input type="text" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'" v-model="formValue[item.FIELDNAME]"
						 :placeholder="'请输入'+ item.DISPLAYNAME" />
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExNumber' ">
						<input type="number" :maxlength="item.FIELDLENGTH" v-model="formValue[item.FIELDNAME]" :placeholder="'请输入'+ item.DISPLAYNAME" />
					</view>


					<view class="row-value" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item,'M')">
						{{ formValue[item.FIELDNAME] }}
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExReadCard' ">
						<!-- {{ formValue[item.FIELDNAME] || '' }} -->
						<input type="text" :value="formValue[item.FIELDNAME]" disabled />
					</view>

					<view class="flex-row-between myrow row-value" v-if="item.CTRLTYPE == 'ExEnum' ">
						<picker @change="bindPickerChange($event,index)" :value="formValue[item.FIELDNAME+'VI']" :range="formValue[item.FIELDNAME+'List']"
						 range-key="name">
							<view> {{ formValue[item.FIELDNAME+'List'][formValue[item.FIELDNAME+'VI']].name }} </view>
						</picker>
						<text class="cuIcon-triangledownfill text-blue text-bold"></text>
					</view>


					<!-- <view class="cu-form-val btn-img" v-if="item.CTRLTYPE == 'ExUpload' ">
						<button class="cu-btn bg-blue round  sm" @click="updateImg(index,item.FIELDNAME)">
							<text class="cuIcon-upload"></text>
							{{ formValue[item.FIELDNAME] ? '重传' : '上传' }}
						</button>
						<image style="width: 50px;height: 30px;padding-left: 10px;" v-if="formValue[item.FIELDNAME]" :src="formValue['img'+index]"
						 @tap="previewImage(index,item.FIELDNAME)">
						</image>
					</view> -->
				</view>

			</view>
		</view>


		<!-- 子表表 -->
		<view class="main-wrap">
			<view class="title-wrap">
				单据信息
			</view>
			<view class="main-content bg-white">
				<view class="content-row" v-for="(item,index) in configFormSub" v-if="item.ISVISIBLE==1">
					<view class="row-label" :class="item.ISREQUESTED?'must-flag': '' ">
						{{ item.DISPLAYNAME }}
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
						<input class="text-blue" type="text" disabled :value="formValueS[item.FIELDNAME]" />
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExTextBox' ">
						<input type="text" @focus="setActive(index)" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'"
						 v-model="formValueS[item.FIELDNAME]" :placeholder="'请输入'+ item.DISPLAYNAME" />
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExNumber' ">
						<input type="number" :maxlength="item.FIELDLENGTH"  v-model="formValueS[item.FIELDNAME]"
						 :placeholder="'请输入'+ item.DISPLAYNAME" />
					</view>


					<view class="row-value" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item,index)">
						{{ formValueS[item.FIELDNAME] }}
					</view>

					<view class="row-value" v-if="item.CTRLTYPE == 'ExReadCard' ">
						{{ formValueS[item.FIELDNAME] || '' }}
					</view>

					<view class="flex-row-between myrow row-value" v-if="item.CTRLTYPE == 'ExEnum' ">
						<picker @change="bindPickerChange($event,index)" :value="formValueS[item.FIELDNAME+'VI']" :range="formValue[item.FIELDNAME+'List']"
						 range-key="name">
							<view> {{ formValueS[item.FIELDNAME+'List'][formValueS[item.FIELDNAME+'VI']].name }} </view>
						</picker>
						<text class="cuIcon-triangledownfill text-blue text-bold"></text>
					</view>


					<!-- <view class="cu-form-val btn-img" v-if="item.CTRLTYPE == 'ExUpload' ">
						<button class="cu-btn bg-blue round  sm" @click="updateImg(index,item.FIELDNAME)">
							<text class="cuIcon-upload"></text>
							{{ formValue[item.FIELDNAME] ? '重传' : '上传' }}
						</button>
						<image style="width: 50px;height: 30px;padding-left: 10px;" v-if="formValue[item.FIELDNAME]" :src="formValue['img'+index]"
						 @tap="previewImage(index,item.FIELDNAME)">
						</image>
					</view> -->
				</view>

			</view>
		</view>

		<view class="btn-wrap">
			<button class="cu-btn block bg-blue margin-tb-sm lg" @click="submitForm">
				保存
			</button>
		</view>
		

		<!-- <w-picker mode="date" startYear="1970" endYear="2100"  :fields="fields" @confirm="onConfirm($event,'date')"
		 :disabled-after="true" ref="dateTime"></w-picker> -->

		<w-picker
		  mode="date"
		  startYear="1970"
		  endYear="2050"
		  :current="true"
		  :fields="fields"
		  @confirm="onConfirm($event,'date')"
		  :disabled-after="false"
		  ref="dateTime"
		></w-picker>

	</view>

</template>

<script>
	import wPicker from "@/components/w-picker-v2/w-picker.vue";
	import utils from '../../common/util.js'
	var graceChecker = require("../../common/graceChecker.js");
	let _self, ajaxurl, baseUrl, myToken, voluationJson, userId, token, orderData, mainCF = {},
		subCF = {};
	export default {
		data() {
			return {
				configForm: [],
				configFormMain: [],
				configFormSub: [],
				formValue: '',
				formValueS: '',
				formActiveIndex: '',
				fields: 'minute' ,
				activeM : '' // 是否激活主表
			}
		},
		components: {
			wPicker
		},
		onLoad(params) {
			_self = this;
			userId = params.userId
			baseUrl = params.baseUrl
			uni.setNavigationBarTitle({
				title: params.title 
			});
			this.uniSkip.getParams(function(res) {
				_self.configFormMain = res.config.filter(item => {
					return item.GROUPID.slice(-2) == '01';
				});
				_self.configFormSub = res.config.filter(item => {
					return item.GROUPID.slice(-2) == '02';
				});
				_self.formValue = _self.initForm(_self.configFormMain);
				// console.log(_self.formValue);
				let formValueSC = _self.initForm(_self.configFormSub);
				orderData = res.items
				orderData.PNUM = ''
				// console.log(orderData);
				for (let key in formValueSC) {
					orderData[key] = orderData[key] ? orderData[key] : formValueSC[key];
				}
				_self.formValueS = orderData;
				// console.log( _self.formValueS );
				token = res.token
				ajaxurl = res.ajaxURL

				// if (item.GROUPID.slice(-2) == '01') {
				// 	mainCF[item.FIELDNAME] = ''
				// } else {
				// 	subCF[item.FIELDNAME] = ''
				// }

				// _self.initForm();
			})
		},
		onShow() {
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
						if(this.activeM == 'M'){
							_self.formValue[tntKey] = info[tntVal]
						}else{
							_self.formValueS[tntKey] = info[tntVal]
						}
				})
			})
		},
		onUnload() {
			// 移除监听事件  
			uni.$off('getSelectItem');
		},
		methods: {
			dateEvent(e, i) {
				_self.dateTimekey = e.FIELDNAME;
				this.fields = e.EXPESSION
				this.activeM = i
				this.$refs.dateTime.show();
			},
			setActive(i) {
				// _self.formActiveIndex = i;
				// console.log(i);
			},
			onConfirm(val) {
				// console.log(val);
				if(this.activeM == 'M'){
					_self.formValue[_self.dateTimekey] = val.result;
				}
				_self.formValueS[_self.dateTimekey] = val.result;
				
			},
			initForm(data) {
				let _formValue = {};
				// console.log(data);
				data.forEach((item, index) => {
					let tipText = item.DEFAULTVALUE || '';
					if (item.CTRLTYPE == 'ExSearchMatch') {
						if (!item.DEFAULTVALUE) {
							tipText = '请选择' + item.DISPLAYNAME;
						}
					} else if (item.CTRLTYPE == 'ExDateTime') {
						tipText = item.DEFAULTVALUE ? utils.resolveDate(item.DEFAULTVALUE) : utils.getToDay();
						// console.log(tipText);
					} else if (item.CTRLTYPE == 'ExUpload') {
						_formValue['img' + index] = '';
					} else if (item.CTRLTYPE == 'ExEnum') {
						let str = item.EXPESSION.split('|');
						let valIndex = item.DEFAULTVALUE || 0;
						let arr = utils.strToArray(str[1]);
						arr.forEach((item, index) => {
							if (item.id == item.DEFAULTVALUE) {
								_formValue[item.FIELDNAME + 'VI'] = index;
								return;
							}
						});
						tipText = valIndex;
						_formValue[item.FIELDNAME + 'VI'] = valIndex;
						_formValue[item.FIELDNAME + 'List'] = arr;
					} else if (item.CTRLTYPE == 'ExReadCard') {
						tipText = '' //  orderData[item.FIELDNAME]
					}
					// console.log(tipText);
					_formValue[item.FIELDNAME] = tipText
				})
				// console.log(JSON.stringify(_formValue));
				return _formValue;
				// _self.formValue = _formValue;
				// _self.$set(_self.formValue,  _self.TabCur, _formValue);
			},
			searchEvent: function(e, num) {
				let ajaxUrlArray = e.EXPESSION.split('|');
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : ''
				this.activeM = num 
				// console.log(ajaxUrl);
				// if (num || num == 0) {
				// 	_self.formActiveIndex = num;
				// }
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
			bindPickerChange(e, n) {
				// console.log(e);
				_self.formActiveIndex = n;
				let val = e.target.value;
				let id = _self.configForm[n].FIELDNAME;
				_self.formValue[id + 'VI'] = val;
				_self.formValue[id] = _self.formValue[id + 'List'][val].id;
			},
			submitForm() {
				let data = _self.formValue;
				data.userId = userId
				// 先验证主表
				let rule = utils.getRules(_self.configFormMain);
				var checkRes = graceChecker.check(data, rule);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				// 验证子表
				let rule2 = utils.getRules(_self.configFormSub);
				var checkRes2 = graceChecker.check(this.formValueS, rule2);
				if (!checkRes2) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				
				
				this.resetSaveData(data)
				let dataArr = { ..._self.formValue,
					ASSIGNPLAN_DTLS: [_self.formValueS]
				};
				// console.log(JSON.stringify(dataArr));
				// console.log(ajaxurl);
				let params = {
					method: 'POST',
					url: ajaxurl,
					data: dataArr,
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
						_self.$utils.tips('提交成功')
						// _self.initForm();
						setTimeout(()=>{
							uni.navigateBack({})
						},1500)
					})
			},
			resetSaveData(data) {

				for (let key in mainCF) {
					mainCF[key] = data[key]
				}

				for (let key in subCF) {
					subCF[key] = data[key]
				}

			},

			// 图片上传
			updateImg(e, id) {
				// console.log(e,id);
				_self.formActiveIndex = e;
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
									if (res.Result.length === 1) {
										imgUrlStr = res.Result[0];
									} else {
										res.Result.forEach((item) => {
											imgUrlStr = item + '&';
										})
									}
									// console.log(imgUrlStr);
									_self.formValue[id] = imgUrlStr;
									let dw = 'img' + e;
									_self.formValue[dw] = baseUrl + imgUrlStr;
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
				var imageList = _self.formValue['img' + e];
				// console.log(imageList);
				uni.previewImage({
					current: 0,
					urls: [imageList]
				})
			},

		}
	}
</script>

<style lang="scss">
	.main-wrap {
		.title-wrap {
			padding: 20rpx;
			margin: 10rpx 0;
			background-color: #FFFFFF;
			font-weight: bold;
		}

		.main-content {
			padding: 20rpx;

			.content-row {
				border-bottom: 1rpx solid #DDDDDD;
				display: flex;
				// background-color: #00BFFF;
				padding: 20rpx 0;
				align-items: center;

				.row-label {
					width: 200rpx;
					position: relative;
					left: 0;
				}
			}
			
			
		}


	}

	.must-flag::before {
		content: '*';
		color: red;
		position: absolute;
		left: -10rpx;
		top: 20%;
	}
	
	.btn-wrap{
		padding: 20rpx 20rpx;
	}
	
	.content-row:focus-within{
		border-bottom: 1rpx solid #1677ff;
		
	}
</style>

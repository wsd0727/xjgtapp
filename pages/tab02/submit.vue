<template>
<!-- 运单编辑 -->
	<view class="">
		<view class="card-list-wrapper">
			<form>
				<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-if='item.ISVISIBLE==1'
				 v-for="(item,index) in configForm">
					<view class="title">
						<text class="text-red" v-if="item.ISREQUESTED==1">*</text>{{ item.DISPLAYNAME }}
					</view>
					<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
						{{ formValue[item.FIELDNAME] }}
					</view>

					<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
						<input type="text" @focus="setActive(index)" v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'"
						 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
						<input type="number" @focus="setActive(index)" v-if="item.FIELDTYPE == 'number' || item.FIELDTYPE == 'decimal'"
						 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
					</view>
					
					<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExNumber' ">
						<input type="number" @focus="setActive(index)" @input="listenNum(item)"
						 v-model="formValue[item.FIELDNAME]" value="" :placeholder="'请输入'+ item.DISPLAYNAME" />
					</view>

					<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item,index)">
						{{ formValue[item.FIELDNAME] }}
					</view>

					<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
						{{ formValue[item.FIELDNAME] || '' }}
					</view>

					<view class="flex-row-between myrow" v-if="item.CTRLTYPE == 'ExEnum' ">
						<picker @change="bindPickerChange($event,item.FIELDNAME,index)" 
						:disabled="item.ISCUSEDIT"
						:value="formValue[item.FIELDNAME+'VI']" :range="formValue[item.FIELDNAME+index]">
							<view> {{ formValue[item.FIELDNAME+index][formValue[item.FIELDNAME+'VI']] }} </view>
						</picker>
						<text class="cuIcon-triangledownfill text-blue text-bold"></text>
					</view>

					<view class="cu-form-val btn-img" v-if="item.CTRLTYPE == 'ExUpload' ">
						<button class="cu-btn bg-blue round  sm" @click="updateImg(index,item.FIELDNAME)">
							<text class="cuIcon-upload"></text>
							{{ formValue[item.FIELDNAME] ? '重传' : '上传' }}
						</button>
						<image style="width: 50px;height: 30px;padding-left: 10px;" v-if="formValue[item.FIELDNAME]" :src="formValue['img'+index]"
						 @tap="previewImage(index,item.FIELDNAME)">
						</image>
					</view>


				</view>
				<button class="cu-btn block bg-blue margin-tb-sm lg"
				 :disabled="isDisabled"
				 :loading="isDisabled"
				 @click="submitForm">
					保存
				</button>
			</form>
		</view>

		<w-picker mode="dateTime" startYear="2000" endYear="2050" step="1" :defaultVal="[1,1,1,1,2,5]" :current="true"
		 @confirm="onConfirm" ref="dateTime" themeColor="#f00"></w-picker>
	</view>

</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import utils from '../../common/util.js'
	var graceChecker = require("../../common/graceChecker.js");
	let _self, ajaxurl,detailAjaxUrl, baseUrl, myToken, voluationJson, userId, token ,searchDataConfig=[];
	export default {
		data() {
			return {
				configForm: [],
				formValue: '',
				order:'',
				formActiveIndex: '',
				isDisabled : false
			}
		},
		components: {
			wPicker
		},
		onLoad(params) {
			_self = this;
			userId = params.userId
			baseUrl = params.baseUrl
			detailAjaxUrl = params.detailAjaxUrl
			console.log(params);
			this.uniSkip.getParams(function(res) {
				// console.log(JSON.stringify(res.config));
				_self.configForm = res.config.DYNAMICMODEL.Add;
				_self.order = res.items
				token = res.token
				res.config.CHILDRENS.forEach((item) => {
					if(item.ISFUNCTION == '3'){
						ajaxurl = item.INTERFACEURL
					}
				})
				uni.setNavigationBarTitle({
					title: res.MODULEIDNAME
				});
				// console.log(JSON.stringify(res));
				_self.initForm();
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
					_self.formValue[tntKey] = info[tntVal]
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
				this.$refs.dateTime.show();
				_self.formActiveIndex = i;
			},
			setActive(i) {
				_self.formActiveIndex = i;
				// console.log(i);
			},
			
			// 监听
			listenNum(cf) {
				let val = this.formValue[cf.FIELDNAME] ;
				if(cf.DECIMALPOINT == 0){
					this.formValue[cf.FIELDNAME] = val.replace(/[^\d]/g,'')
				}else if( val.includes('.') ){ // 是否包含小数
					let pointNum = 	val.split('.')[1].length ; // 小数后面多少位
					if( pointNum > cf.DECIMALPOINT ){ 
						let nnn = parseInt(cf.DECIMALPOINT) ;
						let newVal = parseFloat(val).toFixed(nnn);
						this.formValue[cf.FIELDNAME] = newVal
					} 
				}
			},
			
			onConfirm(val) {
				console.log(val);
				_self.formValue[_self.dateTimekey] = val.result;
			},
			initForm() {
				// console.log('执行表单序列');
				let _formValue = {};
				_self.configForm.forEach((item, index) => {
					let tipText = item.DEFAULTVALUE || '';
					if (item.CTRLTYPE == 'ExSearchMatch') {
						if (!item.DEFAULTVALUE) {
							tipText = '请选择' + item.DISPLAYNAME;
						} else if (item.DEFAULTVALUE == 'search') {
							// _self.initSearch(item, index);
							searchDataConfig.push(item)
						}
					} else if (item.CTRLTYPE == 'ExDateTime') {
						tipText = utils.getToDay();
					} else if (item.CTRLTYPE == 'ExUpload') {
						_formValue['img' + index] = '';
						console.log(JSON.stringify(item.FIELDNAME));
					} else if (item.CTRLTYPE == 'ExEnum') {
						let str = item.EXPESSION.split('|');
						let arr = utils.strToArray(str[1]);
						let val = '',
							valIndex = 0;
						// console.log(JSON.stringify(arr));
						arr.forEach((item, index) => {
							if (item.id == str[2]) {
								valIndex = index
								val = item.id
								return null;
							}
						})
						let arrlist = item.FIELDNAME + index;
						_formValue[arrlist] = arr.map((item) => {
							return item.name
						});
						_formValue[item.FIELDNAME] = val || 0;
						_formValue[item.FIELDNAME + 'VI'] = valIndex
						_formValue[item.FIELDNAME + 'List'] = arr
					}

					_formValue[item.FIELDNAME] = tipText
				})
				let orderSource = JSON.parse(JSON.stringify(_self.order)) ;
				// for( const key in _formValue){
				// 	if( !orderSource[key]  ){
				// 		orderSource[key] = _formValue[key]
				// 	}
				// }
				// console.log(JSON.stringify(orderSource));
				_self.getDetail(orderSource,_formValue )
				// _self.formValue = orderSource ;
				this.searchLoop();
				// _self.$set(_self.formValue,  _self.TabCur, _formValue);
			},
			
			// 查询详情数据和配置数据合并
			getDetail(orderSource,cfdata) {
				// console.log(baseUrl+detailAjaxUrl);
				this.$axios({
					url: baseUrl+detailAjaxUrl,
					data:orderSource,
					token: token,
					isLoading:1
				}).then(res=>{
					// console.log(res);
					let { Result } = res ;
					let tnt = Result ;
					for( const key in cfdata){
						if( !tnt[key]  ){
							tnt[key] = cfdata[key]
						}
					}
					_self.formValue = tnt ;
					console.log(cfdata);
					console.log(_self.formValue);
					
				})
				
			},
			
			searchEvent: function(e, num) {
				let ajaxUrlArray = e.EXPESSION.split('|');
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : ''
				// console.log(ajaxUrl);
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
				let requestData = utils.getUrlParamteter(ajaxParamsArr[1])
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
			
			// 递归查询初始的默认值 
			searchLoop(data) {
				let ttt =function(i){
					if(i>=searchDataConfig.length){
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
						// console.log('i=33==='+i);
						voluationJson = ajaxParamsArr[2];
						let requestDataInIt = {
							...requestData,
							VNAME: '',
							PageInfo: {
								page: 1,
								rows: 100,
								sidex: "BILLNO",
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

			bindPickerChange: function(e, id, n) {
				_self.formActiveIndex = n;
				let val = e.target.value;
				_self.formValue[id + 'VI'] = val;
				_self.formValue[id + 'List'].forEach((item, index) => {
					if (index == val) {
						return _self.formValue[id] = item.id;
					}
				})
			},
			submitForm() {
				let data = _self.formValue;
				data.userId = userId
				let rule = utils.getRules(_self.configForm);
				var checkRes = graceChecker.check(data, rule);
				// console.log(JSON.stringify(rule));
				// console.log(data);
				// console.log(baseUrl + ajaxurl);
				if (!checkRes) {
					return uni.showToast({
						title: graceChecker.error,
						icon: "none"
					});
				}
				let dataArr = [data];
				_self.isDisabled = true
				let params = {
					method: 'POST',
					url: baseUrl + ajaxurl,
					data: JSON.stringify(dataArr),
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
						_self.isDisabled = false
						setTimeout(a=>{
							uni.navigateBack({
							})
						},1500)
						
					})
					.catch(e=>{
						_self.isDisabled = false
					})
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

<style>
	.card-list-wrapper {
		width: 710upx;
		height: 100upx;
		margin: 20upx auto;
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
		align-items: center;
	}

	.cu-form-group .cu-form-val {
		height: 60upx;
		line-height: 60upx;
	}

	.cu-form-group .cu-form-input input {
		width: 50vw;
		text-align: right;
	}

	.btn-img {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.btn-img image {
		vertical-align: auto;

	}
</style>

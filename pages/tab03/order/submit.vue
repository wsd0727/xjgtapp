<template>
	<view class="">
		<view  class="card-list-wrapper">
			<form>
				<view class="cu-form-group" :class="formActiveIndex==index?   'solid-bottom-blue':'' " v-if='item.ISVISIBLE==1' v-for="(item,index) in configForm">
					<view class="title">
						<text class="text-red" v-if="item.ISREQUESTED==1">*</text>{{ item.DISPLAYNAME }}
					</view>
					<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item,index)">
						 {{ formValue[item.FIELDNAME] }}
					</view>
					
					<view class="cu-form-input" v-if="item.CTRLTYPE == 'ExTextBox' ">
						<input  type="text" @focus="setActive(index)"   v-if="item.FIELDTYPE == 'varchar'|| item.FIELDTYPE == 'nvarchar'" v-model="formValue[item.FIELDNAME]"  value="" :placeholder="'请输入'+ item.DISPLAYNAME"/>
						<input  type="number" @focus="setActive(index)" v-if="item.FIELDTYPE == 'number' || item.FIELDTYPE == 'decimal'" v-model="formValue[item.FIELDNAME]"  value="" :placeholder="'请输入'+ item.DISPLAYNAME"/>
					</view>
					
					<view class="cu-form-val text-blue" v-if="item.CTRLTYPE == 'ExDateTime' " @click="dateEvent(item,index)">
						{{  formValue[item.FIELDNAME] }}
					</view>
					
					<view class="cu-form-val text-gray" v-if="item.CTRLTYPE == 'ExReadCard' ">
						{{ formValue[item.FIELDNAME] || '' }}
					</view>
					
					<view class="flex-row-between myrow" v-if="item.CTRLTYPE == 'ExEnum' ">
						<picker @change="bindPickerChange($event,item.FIELDNAME,index)" :value="formValue[itemC.FIELDNAME+'VI']"
						 :range="formValue[item.FIELDNAME+index]">
							<view> {{ formValue[item.FIELDNAME+index][formValue[item.FIELDNAME+'VI']] }} </view>
						</picker>
						<text class="cuIcon-triangledownfill text-blue text-bold"></text>
					</view>
					
					<view class="cu-form-val btn-img" v-if="item.CTRLTYPE == 'ExUpload' " >
						<button class="cu-btn bg-blue round  sm" @click="updateImg(index,item.FIELDNAME)">
							<text class="cuIcon-upload"></text> 
							{{ formValue[item.FIELDNAME] ? '重传' : '上传' }}
						</button>
						<image style="width: 50px;height: 30px;padding-left: 10px;" 
						 v-if="formValue[item.FIELDNAME]"
						:src="formValue['img'+index]"  
						@tap="previewImage(index,item.FIELDNAME)" >
						</image>
					</view>
					
					
				</view>
				<button class="cu-btn block bg-blue margin-tb-sm lg" @click="submitForm">
					<!-- <text class="cuIcon-loading2 cuIconfont-spin"></text> --> 
					保存
				</button>
			</form>
		</view>
		
		<w-picker 
			mode="dateTime" 
			startYear="2000" 
			endYear="2050"
			step="1"
			:defaultVal="[1,1,1,1,2,5]" 
			:current="true" 
			@confirm="onConfirm" 
			ref="dateTime" 
			themeColor="#f00"
		></w-picker>
	</view>
	
</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import utils from '../../common/util.js'
	var graceChecker = require("../../common/graceChecker.js");	 
	let _self,ajaxurl,baseUrl,myToken,voluationJson,userId,token ;
export default{
	data(){
		return {
			configForm:[],
			formValue:'',
			formActiveIndex:'',
		}
	},
	components: {
		wPicker
	},
	onLoad(params) {
		_self = this ;
		userId = params.userId
		baseUrl= params.baseUrl
		console.log(11199);
		// console.log(JSON.stringify(params));
		this.uniSkip.getParams(function(res){
			_self.configForm = res.DYNAMICMODEL.Add ;
			token = res.token
			res.CHILDRENS.forEach((item)=>{
				ajaxurl = item.ISFUNCTION == 3 ? item.INTERFACEURL :'';
			})	
			uni.setNavigationBarTitle({
					title: res.MODULEIDNAME
			});
			console.log(JSON.stringify(res));
			_self.initForm();
		})
	},
	onShow() {
		uni.$on('getSelectItem',(info)=>{  
				// console.log(JSON.stringify(info)); 
				if(!voluationJson || voluationJson.indexOf('&')< 1 ){ return null }
				let voluationJsonArr = voluationJson.split('&') ;
				// console.log(voluationJsonArr);
				voluationJsonArr.forEach((item,index)=>{
					let tnt = item.split('=');
					let tntKey = tnt[0], tntVal = tnt[1] ;
					_self.formValue[tntKey] = info[tntVal]
				})
		})
	},
	onUnload() {  
		// 移除监听事件  
	  uni.$off('getSelectItem');  
	},
	methods:{
		dateEvent(e,i){
			_self.dateTimekey = e.FIELDNAME ;
			this.$refs.dateTime.show();
			_self.formActiveIndex = i ;
		},
		setActive(i){
			_self.formActiveIndex = i ;
			// console.log(i);
		},
		onConfirm(val){
			// console.log(val);
			_self.formValue[_self.dateTimekey] = val.result ;
		},
		initForm(){
			console.log('执行表单序列');
			let _formValue={} ;
			_self.configForm.forEach((item,index)=>{
				let tipText='' ;
				if(item.CTRLTYPE == 'ExSearchMatch'){
					tipText = '请选择' +  item.DISPLAYNAME ;
				}else if(item.CTRLTYPE == 'ExDateTime'){
					tipText = utils.getToDay(); 
				}else if(item.CTRLTYPE == 'ExUpload'){
					_formValue['img'+index] = '';
				}else if(item.CTRLTYPE == 'ExEnum'){
					let str = item.EXPESSION.split('|');
					let arr = utils.strToArray(str[1]);
					let val = '', valIndex = 0;
						console.log(JSON.stringify(arr));
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
			_self.formValue = _formValue ;
			
			console.log(JSON.stringify(_formValue));
			// _self.$set(_self.formValue,  _self.TabCur, _formValue);
		},
		searchEvent: function(e,num) {
			let ajaxUrlArray = e.EXPESSION.split('|') ;
			let ajaxUrl = ajaxUrlArray[0] == 'URL' ?  ajaxUrlArray[1] :''
			// console.log(ajaxUrl);
			if(num || num ==0 ){ _self.formActiveIndex = num ; }
			if(!ajaxUrl){
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
					url: baseUrl + ajaxParamsArr[0] ,
					title: '查询'+ e.DISPLAYNAME ,
					myToken:myToken ,
					requestData:requestData
					// condation: _self.condations
				}
			})
		},
		bindPickerChange: function(e, id, n) {
			_self.formActiveIndex = n ;
			let val = e.target.value;
			_self.formValue[id + 'VI'] = val;
			_self.formValue[id + 'List'].forEach((item, index) => {
				if (index == val) {
					return _self.formValue[id] = item.id;
				}
			})
		},
		submitForm(){
			let data = _self.formValue;
			data.userId = userId
			let rule = utils.getRules(_self.configForm);
			var checkRes = graceChecker.check(data, rule);
			// console.log(JSON.stringify(rule));
			// console.log(data);
			// console.log(checkRes);
			if(!checkRes){
				return	uni.showToast({ title: graceChecker.error, icon: "none" });
			}
			let dataArr = [ data]
			uni.request({
				url:baseUrl + ajaxurl,
				method:'POST',
				header: { Authorization:'BasicAuth '+token },
				data:dataArr,
				success:function(res){
					console.log(res.data);
					if(res.data.IsSuccess && res.statusCode == 200){
						uni.showToast({
							title: '保存成功',
							icon: 'none',
							duration: 1000
						});
						_self.initForm();
					}else{
						uni.showToast({
							title: '保存失败:'+ res.data.Message ,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})
			console.log(ajaxurl);
			console.log(JSON.stringify(dataArr));
		},
		// 图片上传
		updateImg(e,id){
			// console.log(e,id);
			_self.formActiveIndex = e ;
			uni.chooseImage({
					count: 1,
					success: (chooseImageRes) => {
							const tempFilePaths = chooseImageRes.tempFilePaths;
							console.log(tempFilePaths);
							uni.uploadFile({
									url: baseUrl + '/api/Common/Upload',
									filePath: tempFilePaths[0],
									name: 'file',
									header: { Authorization:'BasicAuth '+token },
									formData: {
											'userId': userId
									},
									success: (uploadFileRes) => {
										  
											let res = JSON.parse(uploadFileRes.data)
											if(uploadFileRes.statusCode == 200){
												// let imgUrlArr = uploadFileRes.data.Result;
												// console.log(res);
												let imgUrlStr = '';
												res.Result.forEach((item)=>{
													imgUrlStr = item +'&';
												})
												// console.log(imgUrlStr);
												_self.formValue[id] = imgUrlStr ;
												let dw = 'img'+e ;
												_self.formValue[dw] = tempFilePaths;
												// _self.$set(_self.planOrder[e], 'imgurl', tempFilePaths);
												// console.log(_self.planOrder[e].imgurl);
											}else{
												uni.showToast({title: '上传失败'+uploadFileRes.errMsg ,icon: 'none'});
											}
									}
							});
					}
			});
		},
		previewImage(e,id) {
			var imageList = _self.formValue['img'+e];
			// console.log(imageList);
			uni.previewImage({
				current: 0,
				urls: imageList
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
	
	.cu-form-group .cu-form-val{
		height: 60upx;
		line-height: 60upx;
	}
	.cu-form-group .cu-form-input input{
		width: 50vw;
		text-align: right;
	}
	.btn-img{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.btn-img image{
		vertical-align: auto;
		
	}
</style>

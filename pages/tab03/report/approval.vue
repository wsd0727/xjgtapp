<template>
	<!-- 审批流详情 -->
	<view class="">
		<!-- 订单信息 -->
		<view class="card-list-wrapper" >
			
			<view class="card-list-row radius shadow-warp bg-white margin-top"  >
				<view class="card-list-row-1" v-for="(itemC,indexC) in listCFG" v-if="itemC.ISVISIBLE==1" >
					<text class="cuIcon-title" :class="'text-'+ColorList[indexC].name"></text>
					<text class="text-black list-label">{{ itemC.DISPLAYNAME }}： </text>
					<text class="text-grey"> {{ setFormat(itemC.EXPESSION,orderList[itemC.FIELDNAME],orderList) }}</text>
				</view>
			</view>
			
			<view class="card-list-row radius shadow-warp bg-white margin-top"  >
				<view class="">
					<radio-group class="block" @change="RadioChange">
						<view class="cu-form-group margin-top">
							<view class="title">同意</view>
							<radio :class="radio=='A'?'checked':''" :checked="radio=='A'?true:false" value="A"></radio>
						</view>
						<!-- #ifndef MP-ALIPAY -->
						<view class="cu-form-group">
							<view class="title">驳回</view>
							<radio class='radio red' :class="radio=='B'?'checked':''" :checked="radio=='B'?true:false" value="B"></radio>
						</view>
						<view class="cu-form-group">
							<view class="title">驳回步骤</view>
							<picker @change="PickerChange" range-key="FROMNODENAME" :value="rejectIndex" :range="rejectList">
								<view class="picker">
									{{ rejectList[rejectIndex].FROMNODENAME }}
								</view>
							</picker>
						</view>
						
						<view class="cu-form-group align-start">
							<view class="title">审批意见</view>
							<textarea maxlength="-1" :disabled="modalName!=null" @input="textareaBInput" placeholder="多行文本输入框"></textarea>
						</view>
						<!-- <view class="cu-form-group">
							<view class="title">定义颜色</view>
							<view>
								<radio class='blue radio' :class="radio=='C'?'checked':''" :checked="radio=='C'?true:false" value="C"></radio>
								<radio class='red margin-left-sm' :class="radio=='D'?'checked':''" :checked="radio=='D'?true:false" value="D"></radio>
							</view>
						</view> -->
						<!-- #endif -->
					</radio-group>
				</view>
			</view>
			
			<view class="">
				<button class="cu-btn block bg-blue margin-tb-sm lg" @click="approvalsubmit">
					提交
				</button>
			</view>
		</view>
		
	</view>
	
</template>

<script>
	import utils from "@/common/util.js"
	import api from "@/common/api.js"
	let _self, baseUrl,myToken,token,ModuleType,Code,
	voluationJson,userId,ajaxUrl,oneSubTable={},submitId;
	
	export default{
		data(){
			return{
				listCFG:[],
				orderList:[],
				ColorList: this.ColorList,
				rejectList:[ {FROMNODENAME : '请选择驳回步骤'}], // 驳回列表
				noteList:[] ,  // 历史审批流
				radio:'',
				rejectIndex:0 , // 驳回节点选择
				textareaBValue:''
			}
		},
		onLoad(params) {
			_self = this ;
			ajaxUrl = params.baseUrl
			userId  = params.userId
			_self.reviewUrl = params.reviewUrl
			// console.log(params);
			uni.setNavigationBarTitle({
					title: params.title+'审批'
			});
			this.uniSkip.getParams(function(data) {
				// console.log(data.token);
				_self.orderList = data.items 
				_self.listCFG = data.listConfig
				baseUrl = data.baseUrl
				ModuleType = data.ModuleType
				Code = data.Code 
				token   = data.token
				// console.log(ModuleType,Code);
				_self.getApprovalDate(); // 获取审批流信息
				// _self.initConfig(data.config) 	
			})
		},
		methods:{
			setFormat(a,b,c){
				return utils.setFormat(a,b,c);
			},
			RadioChange(e) {
				this.radio = e.detail.value
			},
			PickerChange(e) {
				this.rejectIndex = e.detail.value
			},
			textareaBInput(e) {
				this.textareaBValue = e.detail.value
			},
			getApprovalDate(){
				let url = baseUrl + api.apiPublic.getApprovalDate +_self.orderList.BILLNO ;
				console.log(url);
				uni.request({
				 	url: url,
					header: { Authorization:'BasicAuth '+token },
				 	data : {} ,
				 	method: "POST",
				 	success: function(res) {
						utils.delayHide()
						// console.log(JSON.stringify(res));
						let result = res.data.Result;
						if(res.data.IsSuccess){
							let atnt = JSON.parse(result.SCHEMECONTENT).SchemeContent;
							let notes = JSON.parse(atnt).Flow.nodes;
							let lines = JSON.parse(atnt).Flow.lines;
							// console.log(atnt);
							// console.log(notes);
							submitId = result.Id
							_self.getApprovalGetOut(result.Id,result.ActivityId);
						}
					},
				})
			},
			getApprovalGetOut(id,NodeId){
				let url = baseUrl + '/api/PhoneApproval/GetFlowNodes' ;
				// console.log(id,NodeId);
				uni.request({
				 	url: url,
					header: { Authorization:'BasicAuth '+token },
				 	data : {Id:id,NodeId:NodeId} ,
				 	method: "POST",
				 	success: function(res) {
						utils.delayHide()
						console.log(JSON.stringify(res));
						if(res.data.IsSuccess){
							_self.rejectList = _self.rejectList.concat(res.data.Result) ;
						}else{
							utils.tips('驳回节点获取失败'+res.data.Message)
						}
					},
				})
			},
			approvalsubmit(){
				let url =  baseUrl+'/api/PhoneApproval/SubmitApproval';
				let rejectId =  _self.radio == 'A' ?'': _self.rejectList[_self.rejectIndex].PROCESSID;
				if(!_self.radio){
					return utils.tips('请选择审批意见');
				}else if(_self.radio == 'B' && _self.rejectIndex==0){
					return utils.tips('请选择驳回步骤');
				}
				
				let atnt = {
						NodeRejectStep: rejectId ,
						VerificationOpinion: _self.textareaBValue ,
						VerificationFinally: _self.radio == 'A'?'1':'3' 
				}
				
				let mydata ={
					ModuleType: ModuleType,
					VerificationData: JSON.stringify(atnt),
					WfProcessId: submitId ,
					BILLNO: _self.orderList.BILLNO
				}
				console.log(url);
				console.log(mydata);
				uni.request({
				 	url: url,
					header: { Authorization:'BasicAuth '+token },
				 	data : mydata ,
				 	method: "POST",
				 	success: function(res) {
						utils.delayHide()
						console.log(JSON.stringify(res));
						let result = res.data.Result;
						if(res.data.IsSuccess){
							return uni.navigateBack({
								delta:1
							})
						}else{
						 	return utils.tips('失败'+res.data.Message);
						}
					},
				})
			}
		}
	}
</script>

<style scoped>
	.card-list-wrapper{width:710rpx;margin: 0 20rpx;}
	.list-label{width: 150rpx;display: inline-block;}
	.card-list-row{padding: 20rpx;}
	.card-list-row-1{padding: 8rpx;}
</style>

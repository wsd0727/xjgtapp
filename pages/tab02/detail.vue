<template>
	<view class="">
		<!-- 主表 -->
		<view class="card-wrapper">
			<view class="radius shadow shadow-lg padding-sm bg-white" >
				<view class="flex flex-wrap margin-xs" v-for="(itemC,indexC) in mainTable" v-if="itemC.ISVISIBLE==1"  :key="indexC">
					<view class="flex-sub text-m">
						{{ itemC.DISPLAYNAME }}：
					</view>
					<view class="flex-twice text-black text-m">
						<text class="text-black"> {{ setFormat(itemC.EXPESSION,orderData[itemC.FIELDNAME],orderData) }}</text>
					</view>
				</view>
			</view>
			
			<!-- 子表信息 -->
			<view class="radius shadow shadow-lg bg-white padding-sm margin-top sub-table" v-for="(item,index) in orderData.details" :key="index">
				<view class="flex flex-wrap margin-xs myrow text-m" v-for="(itemC,indexC) in subTable" v-if="itemC.ISVISIBLE==1"  :key="indexC">
					<view class="flex-sub text-m" >
						{{ itemC.DISPLAYNAME }}：
					</view>
					<view class="flex-twice  text-m">
						 <text class="text-black"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
					</view>
				</view>
			</view>
			<view class="flex" v-if="invalidUrl">
					<view class="flex-sub  margin-xs ">
						<button class="cu-btn block bg-red margin-tb-sm lg" 
						:disabled="isDisabled"
						:loading="isDisabled"
						@click="invalidEventSure">
							作废
						</button>
					</view>
					<view class="flex-sub  margin-xs ">
						<button class="cu-btn block bg-blue margin-tb-sm lg" @click="backPage">
							返回
						</button>
					</view>
				
			</view>
			<view class="" v-if="!invalidUrl">
				<view class="margin-xs ">
					<button class="cu-btn block bg-blue margin-top  lg"
					
					 @click="backPage">
						返回
					</button>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import utils from "@/common/util.js"
	let _self,token, baseUrl,myToken,voluationJson,userId,ajaxUrl,oneSubTable={},invalidUrl;
	export default{
		data(){
			return{
				planOrder:'', // 运单的一条列表中 的数据
				orderData:'', // 运单详情的所有数据
				config:'',
				mainTable: [] , // 主表配置
				mainTableValue:{},
				subTable : [] ,// 子表配置
				subValueList:[],
				subCur:0 ,// 当前激活的子表 下标
				invalidUrl:'' , // 通过该值判断是否隐藏作废按钮
				isDisabled : false
			}
		},
		onLoad(params) {
			_self = this ;
			baseUrl = params.baseUrl
			ajaxUrl = params.detailAjaxUrl
			invalidUrl = params.invalidAjaxUrl
			_self.invalidUrl = invalidUrl
			console.log(params);
			
			
			userId  = params.userId
			uni.setNavigationBarTitle({
					title: params.title
			});
			// console.log(JSON.stringify(params));
			this.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				_self.planOrder = data.items 
				token = data.token 
				// console.log(token);
				_self.initConfig(data.config) 	
			})
		},
		onShow() {
			
		},
		
		methods:{
			initConfig(add){
				/********** 特殊情况说明
				********* */
				let mainTbaleA = []	,subTableA = [] ;
				add.forEach((item)=>{
					if(item.GROUPID.slice(-2) == '01'){
						mainTbaleA.push(item)
					}else{
						subTableA.push(item)
					}
				})
				_self.mainTable = mainTbaleA
				_self.subTable  = subTableA
				_self.requestDetail();
				// _self.$set(_self.subValueList, 0, oneSubTable);
				 // console.log(JSON.stringify(mainTbaleA));
				 // console.log(JSON.stringify(subTableA));
			},
			backPage(){
				uni.navigateBack({})
			},
			setStatus(e,w){
				return utils.setStatus(e,w);
			},
			setFormat(a,b,c){
				return utils.setFormat(a,b,c);
			},
			
			invalidEventSure(e) {
				// console.log(myurl);
				uni.showModal({ //提醒用户更新
					title: '作废提示',
					showCancel: true,
					content: '您确定要作废该运单吗？',
					success: (res) => {
						if (res.confirm) {
							_self.invalidEvent();
						}
					}
				})
			},
			
			invalidEvent(){
				if(!invalidUrl){
					return uni.showToast({
						title: '没有获取到作废接口' ,
						icon: 'none',
						duration: 1500
					});
				}
				_self.isDisabled = true
				let params = {
					method: 'POST',
					url: baseUrl+invalidUrl ,
					data: _self.orderData ,
					token: token,
					isLoading: true
				}
				_self.$axios(params)
					.then(res => {
						let { IsSuccess,Result,Message } = res;
						_self.isDisabled = false
						_self.$utils.tips('作废成功')
						setTimeout(function() {
							uni.navigateBack({})
						}, 2000);
					})
					.catch(e=>{
						_self.isDisabled = false
					})
				
				
				
			},
			requestDetail(){
				uni.showLoading({title: '加载中'})
				setTimeout(function () {
						uni.hideLoading();
				}, 5000);
				let saveData =   _self.planOrder;
				saveData.userId = userId 
				// console.log(ajaxUrl);
				// console.log(JSON.stringify(saveData));
				
				this.$axios({
					url: baseUrl+ajaxUrl ,
					data:saveData,
					token:token,
					isLoading:true
				}).then(res=>{
					_self.orderData =res.Result.rows
				})
				
				// uni.request({
				// 	url: baseUrl+ajaxUrl ,
				// 	data:saveData,
				// 	header: { Authorization:'BasicAuth '+token },
				// 	method:"POST",
				// 	success:function(res){
				// 		// console.log(res);
				// 		uni.hideLoading();
				// 		if(res.data.IsSuccess && res.statusCode == 200){
				// 			_self.orderData =res.data.Result.rows
				// 		}else{
				// 			uni.showToast({
				// 				title: '详情查询失败:'+ res.data.Message ,
				// 				icon: 'none',
				// 				duration: 2000
				// 			});
				// 		}
				// 	},
				// 	error:function(error){
				// 		uni.hideLoading();
				// 		uni.showToast({
				// 			title: '详情查询失败:'+ res.data.Message ,
				// 			icon: 'none',
				// 			duration: 2000
				// 		});
				// 	}
					
				// })
				
				
			}
		}
	}
</script>

<style scoped>
	.card-wrapper{
		padding: 26upx;
	}
	.myrow{
		min-height: 60rpx;
		/* border-bottom: 1px solid #aaa; */
	}
	.flex-wrap{
		align-items: center;
	}
</style>

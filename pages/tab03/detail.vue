<template>
	<view class="">
		<!-- 主表 -->
		<view class="card-wrapper">
			<view class="radius shadow shadow-lg padding-sm bg-white" >
				<view class="flex flex-wrap margin-xs" v-for="(itemC,indexC) in mainTable" v-if="itemC.ISVISIBLE==1"  :key="indexC">
					<view class="flex-sub text-m text-grey">
						{{ itemC.DISPLAYNAME }}：
					</view>
					<view class="flex-twice  text-m">
						 <text class=" text-black"> {{ setFormat(itemC.EXPESSION,orderData[itemC.FIELDNAME],orderData) }}</text>
					</view>
					
					<!-- <view class="flex-twice text-black" v-if="itemC.CTRLTYPE == 'ExNumber' ">
						<input type="number"  v-model="mainTable[itemC.FIELDNAME]" />
					</view> -->
					
				</view>
			</view>
			<!-- 子表信息 -->
			<view class="radius shadow shadow-lg bg-white padding-sm margin-top sub-table" v-for="(item,index) in orderData.details" :key="index">
				<view class="flex flex-wrap margin-xs myrow" v-for="(itemC,indexC) in subTable" v-if="itemC.ISVISIBLE==1"  :key="indexC">
					<view class="flex-sub" >
						{{ itemC.DISPLAYNAME }}：
					</view>
					<view class="flex-twice text-black">
						<!-- {{ item[itemC.FIELDNAME] ||  '' }} -->
						<!-- <text v-if="itemC.CTRLTYPE == 'ExReadCard' && itemC.EXPESSION.split('|')[0] != 'Enum' ">{{ item[itemC.FIELDNAME] || '' }} {{ item[itemC.FIELDNAME] ==0? '0' : '' }}  </text>
						<text v-if="itemC.EXPESSION.split('|')[0] == 'Enum' " > {{ setStatus(itemC.EXPESSION,item[itemC.FIELDNAME])  }} </text>
						 -->
						 <text class="text-grey"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
					</view>
				</view>
			</view>
			<view class="" @click="backPage">
				<button class="cu-btn block bg-blue margin-tb-sm lg">
					返回
				</button>
			</view>
		</view>
		
	</view>
</template>

<script>
	import utils from "@/common/util.js"
	let _self, baseUrl,myToken,token,voluationJson,userId,ajaxUrl,oneSubTable={};
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
				subCur:0 // 当前激活的子表 下标
			}
		},
		onLoad(params) {
			_self = this ;
			ajaxUrl = params.baseUrl
			userId  = params.userId
			
			uni.setNavigationBarTitle({
					title: params.title
			});
			// console.log(JSON.stringify(params));
			this.uniSkip.getParams(function(data) {
				// console.log(JSON.stringify(data));
				_self.planOrder = data.items 
				token   = data.token
				
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
			requestDetail(){
				// uni.showLoading({title: '加载中'})
				setTimeout(function () {
						uni.hideLoading();
				}, 5000);
				let saveData =   _self.planOrder;
				saveData.userId = userId 
				// console.log(ajaxUrl);
				// console.log(JSON.stringify(saveData));
				// console.log(token);
				
				let params = {
					method: 'POST',
					url: ajaxUrl ,
					data: saveData ,
					token: token,
					isLoading: true
				}
				_self.$axios(params)
					.then(res => {
						let { IsSuccess,Result,Message } = res;
						_self.orderData = Result.rows
						// console.log(Result);
						if(_self.orderData.MATTYPE == 1){
							_self.mainTable.forEach(item=>{
								if(item.FIELDNAME == 'GROSS' || item.FIELDNAME == 'TARE' ){
									item.ISVISIBLE = 0
								}
							})
						}
						// console.log(Result);
					})
			}
		}
	}
</script>

<style scoped>
	.card-wrapper{
		padding: 26upx;
	}
	.myrow{
		min-height: 50rpx;
		border-bottom: 1px solid #aaa;
	}
	.flex-wrap{
		align-items: center;
	}
</style>

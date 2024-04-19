<template name="components">
	
		<!-- <scroll-view scroll-y class="page">
			 <image src="/static/bn01.jpg" mode="widthFix" class="response"></image>
		</scroll-view> -->
		
		<view class="menu-box">
			<view class="menu-border">
				<view 
				:class="['menu-item', 'has-border-'+ (homecfg.length)%3 ]"
				 @click="handleEvent(index)" v-for="(item,index) in homecfg" :key="index">
					<image class="icon-img" :src="baseUrl + item.ICONURL" mode=""></image>
					<view class="menu-title text-m">{{item.FUNCTIONNAME}}</view>
				</view>
			</view>
			
		</view>
	
</template>

<script>
	import utils from '@/common/util.js'

	let _self,userId,baseUrl,token;
	export default {
		data() {
			return {
				homecfg:[],
				baseUrl : '' ,
				ColorList: this.ColorList				
			};
		},
		onLoad() {
			_self = this 
			_self.initConfig(); // 初始化本地配置数据
		},
		onShow() {
			// console.log(this.ColorList);
			if(!userId){_self.initConfig(); } // 初始化本地配置数据
		},
		methods:{
			initConfig(){
				uni.getStorage({
					key:'baseUrl',
					success:function(res){
						baseUrl = res.data
						_self.baseUrl = baseUrl
					}
				})
				uni.getStorage({
					key:'token',
					success:function(res){
						token = res.data
					}
				})
				uni.getStorage({
					key:'userId',
					success:function(res){
						userId = res.data
					}
				})
				uni.getStorage({
					key:'allCFG',
					success:function(res){
						// userId = res.data
						let data = JSON.parse(res.data).homeCFG ;
						_self.homecfg = data ;
						// console.log(data);	
					}
				})
			},
			handleEvent(i){
				console.log(_self.homecfg[i].SHOWTYPE);
				let paths = 'list' ;
				if(_self.homecfg[i].SHOWTYPE == 2 ){
					paths = 'submit';
				}else if(_self.homecfg[i].SHOWTYPE == 3){
					paths = './report/condition'; // 查询报表的查询条件界面
				}else if(_self.homecfg[i].SHOWTYPE == 4){
					paths = './order/index'; // 订单新增
				}else if(_self.homecfg[i].SHOWTYPE == 'D'){
					paths = 'list?isMS=true'; // 进主子表结构
				}else if(_self.homecfg[i].SHOWTYPE == 'Q'){
					paths = 'CarInQueue'; // 排队列表
				}else if(_self.homecfg[i].SHOWTYPE == 'S'){
					paths = 'CarInQueueStats'; // 排队状态
				}
				
				// console.log(_self.homecfg[i].SHOWTYPE);
				console.log(paths);
				_self.uniSkip.navigateTo({
					url: paths+ '?userId='+ userId+'&baseUrl='+baseUrl ,
					data: {..._self.homecfg[i], token:token}
				})
			}
		}
	}
</script>

<style scoped lang="scss">

	.page {
		height: 100vh;
	}
	
	
	.menu-box{
		width: 100vw;
		padding: 20rpx 25rpx;
box-sizing: border-box;
	}
	.menu-border{
		width: 100%;
		border: 1rpx solid #D1D1D1;
		box-sizing: border-box;
		border-radius: 10rpx;
		display: flex;
		flex-wrap: wrap;
		
	}
	.menu-item{
		width: calc(100% / 3) ;
		padding: 30rpx 0;
		box-sizing: border-box;
		border-bottom: 1rpx solid #D1D1D1;
		display: flex;
		flex-direction: column;
		align-items: center;
		.icon-img{
			max-width:80rpx;
			max-height: 80rpx;
		}
		.menu-title{
			padding-top: 16rpx;
		}
	}
	
	// .menu-item:nth-child(3n+1){
	// 	border-left: none;
	// }
	.menu-item:nth-child(3n-1){
		border-left: 1rpx solid #D1D1D1;
		border-right: 1rpx solid #D1D1D1;
	}
	
	.menu-item:last-child{
		border-bottom:none;
	}
	
	.has-border-1:last-child{
		width: calc((100% / 3) + 2rpx);
		border-right: 1rpx solid #D1D1D1;
	}
	.has-border-2:nth-last-child(2){
		border-bottom:none;
	}
	.has-border-0:nth-last-child(2), .has-border-0:nth-last-child(3) {
		border-bottom:none;
	}
	
	
</style>

<template name="sendcar">
	<view class="mypage" :style="{paddingTop:paddingTop}">
		<scroll-view scroll-x class="bg-white nav fixed" v-if="tabList.length!=1">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="index==TabCur?'text-orange cur':''" v-for="(item,index) in tabList" :key="index" @tap="tabSelect(index)">
					{{ tabList[index].FUNCTIONNAME }}
				</view>
			</view>
		</scroll-view>
		<!-- 一车一单 / 一单多车 -->
		<view class="card-list-wrapper" >
			<view class="card-list-row radius shadow-warp bg-white margin-top" v-for="(item,index) in planList" :key="index" @click="openDetail(item)">
				<view class="card-list-row-1" v-for="(itemC) in tabList[TabCur].DYNAMICMODEL.List" v-if="itemC.ISVISIBLE==1" >
					<text class="cuIcon-title text-red"></text>
					<text>{{ itemC.DISPLAYNAME }}：{{ item[itemC.FIELDNAME] || '' }} {{ item[itemC.FIELDNAME] ==0? '0' : '' }} </text>
				</view>
			</view>

			<view class="height50"></view>
		</view>
				
		
		<view class="cu-modal drawer-modal justify-end" :class="modalName=='DrawerModalR'?'show':''" @tap="hideModal">
			<view class="cu-dialog basis-lg" @tap.stop="" style="top:'0px',height:'100vh'">
				<view class="cu-list menu text-left">
					
					<view class="cu-item arrow">
						<view class="content">
							<view>本日</view>
						</view>
					</view>
					
					<view class="cu-item ">
						<view class="content">
							<view>近三天</view>
						</view>
					</view>
					<view class="cu-item ">
						<view class="content">
							<view>本周</view>
						</view>
					</view>
					<view class="cu-item ">
						<view class="content">
							<view>本月</view>
						</view>
					</view>
					
					<view class="cu-item ">
						<view class="content">
							<view>本季</view>
						</view>
					</view>
					<view class="cu-item ">
						<view class="content">
							<view>全年</view>
						</view>
					</view>
				</view>
			</view>
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
	import utils from '@/common/util.js'
	let _self, baseUrl,myToken,voluationJson,userId,
	queryUrl=[],submitUrl,pageList=[], totalList = [], detailUrl = [], 
	tabListCFG;
	let queryParams = {
		StartTime:'2019-05-01 00:00:00',
		EndTime:'2020-01-01 00:00:00',
		userId:'',
		PageInfo:{
			page: 1,
			rows: 6 ,
			sidx:"BILLNO",
			sord:"DESC"
		} 
	}
	export default {
		data() {
			return {
				paddingTop: 0,
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				TabCur: 0, // 当前激活项
				scrollLeft: 0 ,
				CustomBar: this.CustomBar,
				modalName: null,
				planList: [],
				tabList: [],
				
				dateTimekey:''
			};
		},
		components:{
			wPicker
		},
		computed: {
			topHeight(){
				let height = this.CustomBar ;
				var style = `padding-top:45px;`;
				return style
			}
		},
		onLoad() {
			_self = this 
			 // 初始化页面加载动态配置
			_self.initGetStorage()
		},
		onShow() {
			if(_self.tabList.length<1){_self.initConfig()} // 判断初始化配置是否成功
			// if(_self.planList.length<1){ _self.getNewsList() } // 
			uni.getStorage({
				key:'baseUrl',
				success:function(res){
					if(baseUrl != res.data){
						baseUrl = res.data
						_self.initGetStorage();
					}
				}
			})
		},

		
		onNavigationBarButtonTap(){
			_self.showModal('DrawerModalR')
			/* this.uniSkip.navigateTo({
				url: '/pages/public/search?type=Cars&title=车辆列表&from=vue',
				data: {}
			}) */
		},
		//下拉刷新
		onPullDownRefresh : function(){
			// 重置分页及数据
			// page = 1;
			_self.artList = [];
			_self.planList = [];
			pageList[_self.TabCur] = 1 ;
			this.getNewsList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
			uni.showToast({"title":"数据已刷新", icon:"none"});
		},
		// 加载更多
		onReachBottom : function(){
			if( _self.sendCarType == 3 ){
				console.log('无单派车,不加载数据');
				return null;
			}
			console.log('上啦了,要加载');
			this.getNewsList();
		},
		methods:{
			tabSelect(e) {
				_self.artList = [];
				_self.planList = [];
				_self.TabCur = e ;
				this.scrollLeft = (e - 1) * 60;
				pageList[e] = 1;
				_self.getNewsList();
			},
			initGetStorage(){
				uni.getStorage({
					key:'baseUrl',
					success:function(res){
						baseUrl = res.data
					}
				})
				uni.getStorage({
					key:'userId',
					success:function(res){
						userId = res.data
						_self.initConfig();
					}
				})
			},
			initConfig(){
				// 初始化动态配置数据
				uni.getStorage({
					key: 'allCFG',
					success: function(res) {
						let cfgObg = JSON.parse(res.data).poundCFG ;
						let  tabLeb =  cfgObg.length;
						_self.tabList = cfgObg ;
						_self.paddingTop = _self.tabList.length != 1 ? '45px':'0';
					
						cfgObg.forEach((item,index)=>{
								item.CHILDRENS.forEach((item2,index2)=>{
									// console.log(item2.ISFUNCTION);
									if(item2.ISFUNCTION == 2){
										queryUrl.push(item2.INTERFACEURL)
									}else if(item2.ISFUNCTION == 4){
										detailUrl.push(item2.INTERFACEURL)
									}
								})
								pageList.push(1);
								totalList.push(1);
						})
						_self.getNewsList();
						// console.log(queryUrl);
						// console.log(detailUrl);
						// console.log(JSON.stringify(_self.tabList));
					}
				});
			},
			openDetail:function(e){
				let detailAjaxUrl = baseUrl+detailUrl[_self.TabCur] ;
				let title = _self.tabList[_self.TabCur].FUNCTIONNAME ;
				if(!detailUrl[_self.TabCur]){
					return uni.showToast({
						title: '明细接口异常',
						icon: 'none',
						duration: 1000
					})
				}
				_self.uniSkip.navigateTo({
					url:'detail?baseUrl='+detailAjaxUrl+'&userId='+userId+'&title='+title ,
					data:{config:_self.tabList[_self.TabCur].DYNAMICMODEL.Detail ,items:e }
				})
			},
			
			getNewsList(){
				let i = _self.TabCur ;
				// console.log(pageList[i],totalList[i]);
				// console.log(queryUrl[i]);
				if( pageList[i] > totalList[i] ){ 
					return uni.showToast({
						title: '没有数据了',
						icon: 'none',
						duration: 1000
					})
				}else if(!queryUrl[i]){
					_self.planList = [];
					return uni.showToast({
						title: '暂无权限',
						icon: 'none',
						duration: 1000
					})
				}
				uni.showLoading({title: '加载中'})
				setTimeout(function () {
						uni.hideLoading();
				}, 5000);
				// queryUrl =  _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL
				queryParams.userId = userId ;
				queryParams.PageInfo.page = pageList[i] 
				// console.log(JSON.stringify(queryParams));
				console.log(baseUrl + queryUrl[i]);
				uni.request({
				 	url: baseUrl + queryUrl[i],
				 	data : queryParams ,
				 	method:"POST",
				 	success: function(res) {
						utils.delayHide()

						if(res.data.IsSuccess){
							if(pageList[i] == 1){
								_self.planList = res.data.Result.rows
								// console.log('第一次加载第一页数据');
							}else{
								// console.log('第er次加载第一页数据');
								_self.planList = _self.planList.concat(res.data.Result.rows) ;
							}
							totalList[i] = res.data.Result.total
							pageList[i]= pageList[i] + 1; 
						}
				 		// console.log(JSON.stringify(res.data));
					},
					error:function(err){
						utils.delayHide()
						console.log(JSON.stringify(err));
					}
				})
				
			}
			
		}
	}
</script>

<style>	
	.height50{
		height: 50px;
	}
	.card-list-wrapper {
		width: 710upx;
		height: 100upx;
		margin: 0 auto;
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
	}

	.cu-form-group .cu-form-val{
		height: 60upx;
		line-height: 60upx;
	}
	.cu-form-group .cu-form-input input{
		width: 50vw;
		text-align: right;
	}
</style>

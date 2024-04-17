<template name="wcsubmite">
	<view> 
		<form>
			<view class="cu-form-group " v-if='item.ISVISIBLE==1' v-for="(item,index) in options">
				<view class="title">{{ item.DISPLAYNAME }}</view>
				<!-- <view class="title">控件类型{{ item.CTRLTYPE }}</view> -->
				
				<view class="text-blue" v-if="item.CTRLTYPE == 'ExSearchMatch' " @click="searchEvent(item)">
					 {{ item.FIELDNAME }}
				</view>
				
				<view class="" v-if="item.CTRLTYPE == 'ExTextBox' ">
					<input type="text"  value="" :placeholder="'请输入'+ item.DEFAULTNAME"/>
				</view>
				
				<!-- <view class="title">查询的URL{{ item.EXPESSION }}</view> -->
				<!-- <input placeholder="两字短标题" name="input"></input> -->
			</view>
			<!-- <view class="cu-form-group">   margin-top
				<view class="title">{{ options.a }}</view>
				<input placeholder="三字标题" name="input"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">收货地址</view>
				<input placeholder="统一标题的宽度" name="input"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">收货地址</view>
				<input placeholder="输入框带个图标" name="input"></input>
				<text class='cuIcon-locationfill text-orange'></text>
			</view>
			<view class="cu-form-group">
				<view class="title">验证码</view>
				<input placeholder="输入框带个按钮" name="input"></input>
				<button class='cu-btn bg-green shadow'>验证码</button>
			</view>
			<view class="cu-form-group">
				<view class="title">手机号码</view>
				<input placeholder="输入框带标签" name="input"></input>
				<view class="cu-capsule radius">
					<view class='cu-tag bg-blue'>
						+86
					</view>
					<view class="cu-tag line-blue">
						中国大陆
					</view>
				</view>
			</view> -->
			</form>
			<view class="">
				<button class="cu-btn block bg-blue margin-tb-sm lg">
					<!-- <text class="cuIcon-loading2 cuIconfont-spin"></text> --> 
					提交
				</button>
			</view>
	</view>
</template>

<script>
	import utils from '@/common/util.js'
	let _self, purCFG = [],baseUrl,myToken,voluationJson;
	
	export default {
		data() {
			return {
				
			};
		},
		props: {
			options: {
				type: Array,
				default: function(e) {
					return {}
				}
			}
		},
		onLoad() {
			_self = this 
			uni.getStorage({
				key:'baseUrl',
				success:function(res){
					baseUrl = res.data 
					console.log(baseUrl);
				}
			})
		},
		onShow() {
			this.uniSkip.watchParams(function(data) {
				console.log(JSON.stringify(data))
				console.log(JSON.stringify(voluationJson))
				if(!voluationJson || voluationJson.indexOf('&')< 1 ){ return null }
				let voluationJsonArr = voluationJson.split('&') ;
				/* voluationJsonArr.forEach((item,index)=>{
					let tnt = item.split('=');
					let tntKey = tnt[0], tntVal = tnt[1] ;
					_self.condations[tntKey] = data[tntVal]
				}) */
			})
			
			
			console.log(this.options.length);
		},
		methods:{
			searchEvent: function(e) {
				let ajaxUrlArray = e.EXPESSION.split('|') ;
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ?  ajaxUrlArray[1] :''
				console.log(ajaxUrl);
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
				console.log(JSON.stringify(ajaxParamsArr));
				console.log(JSON.stringify(requestData));
				console.log(JSON.stringify(voluationJson));
				this.uniSkip.navigateTo({
					url: '../public/search',
					data: {
						url: "http://139.129.206.158:8111/" + ajaxParamsArr[0] ,
						title: '查询'+ e.DISPLAYNAME ,
						myToken:myToken ,
						requestData:requestData
						// condation: _self.condations
					}
				})
			},
		}
	}
</script>

<style>

</style>

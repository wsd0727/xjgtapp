<template name="notice">
	<view class="mypage" v-html="contentText">
	
	
	</view>

</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import utils from '@/common/util.js'
	import permision from "@/js_sdk/wa-permission/permission.js"
	import queryDrawer from "@/components/drawer/query_drawer.vue"

	let _self, baseUrl, token, voluationJson, userId,
		queryUrl = [],
		submitUrl, pageList = [],
		totalList = [],
		detailUrl = [],
		initQueryJson = '',
		tabListCFG, carParkList, isAuther;
	let queryParams = {
		StartTime: '1980-01-01 00:00:00',
		EndTime: '2100-01-01 00:00:00',
		userId: '',
		PageInfo: {
			page: 1,
			rows: 10,
			sidx: "BILLNO",
			sord: "DESC"
		}
	}
	export default {
		data() {
			return {
				contentText:''
			};
		},
		
		computed: {
			
		},
		onLoad(options) {
			baseUrl = options.baseUrl
			token = options.myToken
			_self = this
			_self.queryNotic();
		},

		methods: {
			queryNotic() {
				let params = {
					method: 'POST',
					url: baseUrl+"/api/ANNOUNCEMENT/List" ,
					data: {},
					token: token,
					isLoading: true
				}
				console.log(params);
				_self.$axios(params)
					.then(res => {
						_self.contentText = res.Result && res.Result[0].NewsContent
					}).catch(err=>{
						this.$utils.tips('入场公告获取失败')
					})
			},
			
			

		}
	}
</script>

<style>
	.notice{
		padding: 20rpx;
		background-color: #fff;
	}
</style>

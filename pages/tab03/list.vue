<template name="sendcar">
	<view class="mypage">

		<!-- 列表 -->
		<view class="card-list-wrapper">
			<view class="card-list-row radius shadow-warp bg-white margin-top" v-for="(item,index) in planList" :key="index"
			 @click="openDetail(item)">
				<view class="card-list-row-1" v-for="(itemC,indexC) in listCFG" v-if="isShowCheck(item,itemC)">
					<text class="text-grey  text-m ">{{ itemC.DISPLAYNAME }}： </text>
					<text class="text-black text-m"> {{ setFormat(itemC.EXPESSION,item[itemC.FIELDNAME],item) }}</text>
				</view>
				
				<view class="order-index">
				</view>
				<view class='order-index-num text-white'>{{ index+1 }}</view>
				<view class="solid-top-gray handel-btn-area" v-if="isShowBtn()">
						<button class="cu-btn round lines-blue" @click.stop="handelEvent(item,1)" v-if="checkInUrl">{{ item.ISQD==1? '已签到':'签到' }}</button>
						<button class="cu-btn round lines-blue" @click.stop="handelEvent(item,2)" v-if="auditURL">{{ '审核' }}</button>
						<button class="cu-btn round lines-blue" @click.stop="handelEvent(item,3)" v-if="invalidUrl">{{ '作废' }}</button>
						<button class="cu-btn round lines-blue" @click.stop="handelEvent(item,4)" v-if="closeURL">{{ '关闭' }}</button>
				</view>

			</view>
		</view>

		<view class="nodata-icon-wrap text-grey" v-if="planList.length<1">
			<text class="cuIcon-warn"></text>
			<view>暂无数据</view>
		</view>
		
		<query-drawer ref="queryDrawer" :queryJsonConfig='queryJsonConfig' :queryJson='queryJson' @querySearch='querySearch'
		 @queryEvent='queryEvent' 
		 @resetQuery='resetQuery'
		 @hideModal='hideModal'
		 @bindPickerChange='bindPickerChange'
		 ></query-drawer>
		
	</view>

</template>

<script>
	import wPicker from "@/components/w-picker/w-picker.vue";
	import utils from '@/common/util.js'
	import queryDrawer from "@/components/drawer/query_drawer.vue"
	
	let _self, baseUrl, myToken, voluationJson, userId, token,
		queryUrl, detailUrl, submitUrl, signingUrl, invalidUrl, checkInUrl, closeURL ,auditURL ,
		page = 1,
		total = 1,
		pageTitle,
		initQueryJson = '' ,
		queryParams22 = {} ,
		isMS = false  ,
		detailCFG, submitCFG;
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
				ColorList: this.ColorList,
				paddingTop: 0,
				startType: 5,
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				TabCur: 0, // 当前激活项
				scrollLeft: 0,
				CustomBar: this.CustomBar,
				modalName: false,
				planList: [],
				tabList: [],
				listCFG: [],
				dateTimekey: '',
				queryJsonConfig: [], // 查询条件配置
				queryJson: {}, // 查询条件提交参数
				invalidUrl: '',
				checkInUrl: '',
				closeURL:'',
				auditURL:''
			};
		},
		components: {
			wPicker,
			queryDrawer
		},

		onLoad(params) {
			_self = this
			userId = params.userId;
			baseUrl = params.baseUrl;
			isMS = params.isMS || false
			submitUrl = '';
			detailUrl = '';
			queryParams22 = {};
			_self.uniSkip.getParams(function(data) {
				token = data.token
				_self.listCFG = data.DYNAMICMODEL.List
				_self.queryJsonConfig = data.DYNAMICMODEL.Query
				// console.log(_self.queryJsonConfig);
				detailCFG = data.DYNAMICMODEL.Detail
				submitCFG = data.DYNAMICMODEL.Add
				pageTitle = data.MODULEIDNAME
				data.CHILDRENS.forEach((item) => {
					// console.log(item.ISFUNCTION,item.INTERFACEURL);
					if (item.ISFUNCTION == 2) { // 查询
						queryUrl = item.INTERFACEURL;
					} else if (item.ISFUNCTION == 4) { // 详情
						detailUrl = item.INTERFACEURL;
					} else if (item.ISFUNCTION == 3) { // 提交
						submitUrl = item.INTERFACEURL
					} else if (item.ISFUNCTION == 5) { // 签收
						signingUrl = item.INTERFACEURL
					} else if (item.ISFUNCTION == 6) { // 签到
						_self.checkInUrl = item.INTERFACEURL
					} else if (item.ISFUNCTION == 9) { // 作废
						_self.invalidUrl = item.INTERFACEURL
					} else if (item.ISFUNCTION == 'C') { // 关闭
						_self.closeURL = item.INTERFACEURL
					}else if (item.ISFUNCTION == 7) { // 审核
						_self.auditURL = item.INTERFACEURL
					}
					// else{
					// 	submitUrl = ''
					// 	detailUrl = '' ;
					// }
				})
				// console.log(data.CHILDRENS);
				uni.setNavigationBarTitle({
					title: pageTitle + '列表'
				});
				
				// 初始化查询条件 并执行数据查询
				
				_self.initQueryJsonFun()
				
				
			})
			// 初始化页面加载动态配置
			// _self.initGetStorage()
		},
		onShow() {
			uni.$on('getSelectItem', (info) => {
				if (!voluationJson || voluationJson.indexOf('&') < 1) {
					return null
				}
				let voluationJsonArr = voluationJson.split('&');
				voluationJsonArr.forEach((item, index) => {
					let tnt = item.split('=');
					let tntKey = tnt[0],
						tntVal = tnt[1];
					if (this.modalName) { // 如果查询条件抽屉开启状态 赋值到查询条件里面
						_self.queryJson[tntKey] = info[tntVal];
					}
				})
			})
		},

		onNavigationBarButtonTap(type) {
			this.modalName = !this.modalName
			if(this.modalName){
				_self.showModal('DrawerModalL')
			}else{
				this.$refs.queryDrawer.closeDrawer('showLeft')
			}
		},
		//下拉刷新
		onPullDownRefresh: function() {
			// 重置分页及数据
			_self.artList = [];
			_self.planList = [];
			page = 1;
			total = 1;
			this.getNewsList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
			uni.showToast({
				"title": "数据已刷新",
				icon: "none"
			});
		},
		// 加载更多
		onReachBottom: function() {
			this.getNewsList();
		},
		methods: {
			// 是否显示的追加判断
			isShowCheck(data,cf){
				if(cf.ISVISIBLE!=1){
					return false;
				}
				if(data.MATTYPE == 1 ){
					if(cf.FIELDNAME == 'GROSS' || cf.FIELDNAME == 'TARE' || cf.FIELDNAME == 'SUTTLE' ){
						return false;
					}
				}
				return true;
			},
			
			showModal(e) {
				// console.log(JSON.stringify(_self.queryJsonConfig) );
				// this.resetQuery()
				this.$refs.queryDrawer.showDrawer('showLeft')
			},
			hideModal(e) {
				this.modalName = false
			},
			dateEvent(e) {
				_self.dateTimekey = e.FIELDNAME;
				this.$refs.dateTime.show();
			},
			
			initQueryJsonFun(){
				let _formValue = {StartTime:'2000-01-01',EndTime:utils.GetDateAfter(0)};
				// console.log(_self.queryJsonConfig);
				_self.queryJsonConfig.forEach((item, index) => {
					let tipText = item.DEFAULTVALUE || '';
					_formValue[item.FIELDNAME] = tipText
					if(item.FIELDNAME=='StartTime'){
						// console.log('StartTime', item.DEFAULTVALUE );
						if(item.DEFAULTVALUE && item.DEFAULTVALUE.includes('D')){
							let dayNum = item.DEFAULTVALUE.replace('D','')
							_formValue.StartTime= utils.GetDateAfter(dayNum) //  '2000-01-01'
						}else{
							_formValue.StartTime= utils.GetDateAfter(-3) //  '2000-01-01'
						}
						item.ISVISIBLE = 0
					}else if(item.FIELDNAME=='EndTime'){
						_formValue.EndTime = utils.GetDateAfter(0)
						item.ISVISIBLE = 0
					}
					 if (item.CTRLTYPE == 'ExEnum') {
						let str = item.EXPESSION.split('|');
						let arr = utils.strToArray(str[1]);
						let val = '',
							valIndex = 0;
						let arrlist = item.FIELDNAME + index;
						_formValue[arrlist] = arr
						if(item.DEFAULTVALUE=='' || item.DEFAULTVALUE==null){
							_formValue[item.FIELDNAME] = ''
						}else if(item.DEFAULTVALUE==0 ){
							_formValue[item.FIELDNAME] = 0
						}
						_formValue[`${item.FIELDNAME}index`] = 0
						
					}
				})
				initQueryJson = JSON.parse(JSON.stringify(_formValue));
				_self.queryJson = JSON.parse(JSON.stringify(initQueryJson));
				// console.log(initQueryJson);
				page = 1;
				total = 1;
				queryParams22 = { ...queryParams,
					...initQueryJson
				};
				
				_self.getNewsList();
			},
			
			bindPickerChange({val, id, index}) { // 枚举确定
				_self.queryJson[id] = val;
				_self.queryJson[`${id}index`] = index;
			},
			
			// 重置查询条件
			resetQuery() {
				_self.queryJson = JSON.parse(JSON.stringify(initQueryJson));
				// _self.$set(_self.queryJson.StartTime, '2000-01-01');
			},
			
			queryEvent() {
				_self.hideModal();
				page = 1;
				total = 1;
				_self.artList = [];
				_self.planList = [];
				// console.log(queryParams);
				// console.log(_self.queryJson);
				queryParams22 = { ...queryParams,
					..._self.queryJson
				};
				// console.log(queryParams22);
				_self.getNewsList();
			},
			
			setFormat(a, b, c) {
				return utils.setFormat(a, b, c);
			},
			openDetail: function(e) {
				let detailAjaxUrl = baseUrl + detailUrl;
				let submitAjaxUrl = baseUrl + submitUrl;
				let title = pageTitle;
				let path = isMS ?'_ms':'';
				// console.log(path);
				// console.log(submitUrl,detailUrl);
				if (submitUrl) {
					_self.uniSkip.navigateTo({
						url: 'submit_main'+path+'?baseUrl=' + baseUrl + '&userId=' + userId + '&title=' + title ,
						data: {
							config: submitCFG,
							items: e,
							token: token,
							ajaxURL: submitAjaxUrl
						}
					})
					return;
				} else if (!detailUrl) {
					return;
				}

				// console.log(token);
				_self.uniSkip.navigateTo({
					url: 'detail?baseUrl=' + detailAjaxUrl + '&userId=' + userId + '&title=' + title,
					data: {
						config: detailCFG,
						items: e,
						token: token
					}
				})
			},
			querySearch(e) {
				let ajaxUrlArray = e.EXPESSION.split('|');
				let ajaxUrl = ajaxUrlArray[0] == 'URL' ? ajaxUrlArray[1] : ''
				// console.log(ajaxUrl);
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
			getNewsList() {
				// console.log(pageList[i],totalList[i]);
				// console.log(queryUrl);
				if (page > total) {
					return uni.showToast({
						title: '没有数据了',
						icon: 'none',
						duration: 1000
					})
				} else if (!queryUrl) {
					_self.planList = [];
					return uni.showToast({
						title: '暂无权限',
						icon: 'none',
						duration: 1000
					})
				}
				setTimeout(function() {
					uni.hideLoading();
				}, 5000);
				// console.log(queryParams22);
				// queryUrl =  _self.tabList[_self.TabCur].CHILDRENS[0].INTERFACEURL
				queryParams22.userId = userId;
				queryParams22.PageInfo.page = page
				queryParams22.PageInfo.sidx = initQueryJson.SIDX 
				queryParams22.PageInfo.sord = (initQueryJson.SIDX && initQueryJson.SIDX.length>0 )? "":"DESC"
				queryParams22.StartTime = queryParams22.StartTime.indexOf(' ') < 0 ? queryParams22.StartTime + ' 00:00:00' : queryParams22.StartTime,
				queryParams22.EndTime = queryParams22.EndTime.indexOf(' ') < 0 ? queryParams22.EndTime + ' 23:59:59' : queryParams22.EndTime
				
				// console.log(JSON.stringify(queryParams22));
				// console.log(baseUrl + queryUrl);
				_self.$axios({
						url: baseUrl + queryUrl,
						data: queryParams22,
						token: token,
						isLoading: true
					})
					.then(res => {
						let {
							IsSuccess,
							Result,
							Message
						} = res;
						// console.log(res)
						if (page == 1) {
							_self.planList = Result.rows
						} else {
							_self.planList = _self.planList.concat(Result.rows);
						}
						total = Result.total || 1;
						page = page + 1;
					})
			},
			
			isShowBtn(){
				// console.log(this.closeURL);
				if(this.checkInUrl || this.invalidUrl ){
					return true ;
				}if( this.auditURL || this.closeURL){
					return true ;
				} 
				return false;
			},

			// 点击事件 签到 ，签收，作废
			handelEvent(e, t) {
				switch (t) {
					case 1:
						_self.openSetting(e); // 获取权限
						break;
					case 2:
						// _self.signing(e);
						_self.invalidEventSure(e,this.auditURL,'审核')
						break;
					case 3:
					 _self.invalidEventSure(e,this.invalidUrl,'作废')
						// _self.openDetail(e);
						break;
					case 4:
						_self.invalidEventSure(e,this.closeURL,'关闭');
						break;
					default:
						break;
				}
			},
			invalidEventSure(e , URL , title ) {
				let myurl = baseUrl + URL;
				// console.log(myurl);
				uni.showModal({ //提醒用户更新
					title:  title+ '提示',
					showCancel: true,
					content: `您确定要${title}该单据吗？`,
					success: (res) => {
						if (res.confirm) {
							_self.invalidEvent(myurl, e,title);
						}
					}
				})
			},
			
			// 作废和关闭使用同一个
			invalidEvent(myurl, data, title ) { // 作废提交
				if (!myurl) {
					return _self.$utils.tips(`没有获取到${title}接口`);
				}
				// console.log(myurl ,title );
				// uni.showLoading({title: '加载中'})
				let params = {
					method: 'POST',
					url: myurl,
					data: data,
					token: token,
					isLoading:1
				}
				// console.log(myurl);
				// console.log(data);
				_self.$axios(params)
					.then(res => {
						let {
							Result,
							Message
						} = res;
						_self.$utils.tips(`${title}成功`)
						_self.queryEvent()
					})
			},

		}
	}
</script>

<style>
	.height50 {
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

	.cu-form-group .cu-form-val {
		height: 60upx;
		line-height: 60upx;
	}

	.cu-form-group .cu-form-input input {
		width: 50vw;
		text-align: right;
	}

	.myquery-wrap {
		align-items: center;
	}

	.query-input {
		height: 30rpx;
		line-height: 30rpx;
	}
</style>

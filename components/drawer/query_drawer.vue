<template>
	<view class="query-drawer">
		<uni-drawer ref="showLeft" mode="left" :width="600" :mask-click="true" @change="change($event,'showLeft')">
			<view class="scroll-view">
				<scroll-view class="scroll-view-box" scroll-y="true">
					<view class="header">
						<text class="header-text">高级查询</text>
						<text class="dicon diconcuowuguanbiquxiao-xianxingyuankuang" @click="closeDrawer('showLeft')"></text>
					</view>

					<view class="time">
						<view class="">
							时间
						</view>
						<view class="time-section">
							<button v-if=" hideDate ? timeIndex==0 :true " :type="timeIndex==0?'primary':'default'" size="mini" @click="changeTimeIndex(0,'all')">全部</button>
							<button v-if=" hideDate ? timeIndex==1 :true "  :type="timeIndex==1?'primary':'default'" size="mini" @click="changeTimeIndex(1,0)">今天</button>
							<button v-if=" hideDate ? timeIndex==2 :true " :type="timeIndex==2?'primary':'default'" size="mini" @click="changeTimeIndex(2,-3)">近三天</button>
							<button v-if=" hideDate ? timeIndex==3 :true" :type="timeIndex==3?'primary':'default'" size="mini" @click="changeTimeIndex(3,-30)">近一月</button>
						</view>
						<view class="time-to" @click="SetTimeTo">
							<!-- <input v-model="queryJson.StartTime" type="text" disabled="disabled" placeholder="开始日期" /> -->
							<view class="input-box">
								{{ queryJson.StartTime || '' }}
							</view>
							<text>至</text>
							<view class="input-box">
								{{ queryJson.EndTime || '' }}
							</view>
							<!-- <input v-model="queryJson.EndTime" type="text" disabled="disabled" placeholder="结束日期" /> -->
						</view>
					</view>

					<view class="content">

						<view class="content-row" v-if="item.ISVISIBLE==1 && item.FIELDNAME!='StartTime' && item.FIELDNAME!='EndTime' " v-for="(item,index) in queryJsonConfig">
							<input type="text" class="text-m" v-if="item.CTRLTYPE == 'ExTextBox' " v-model="queryJson[item.FIELDNAME]" :placeholder=" '请输入' + item.DISPLAYNAME" />
							
							<view class="input-box" v-if="item.CTRLTYPE == 'ExSearchMatch' " @tap="querySearch(item)">
								{{ queryJson[item.FIELDNAME] || '请选择' + item.DISPLAYNAME }}
							</view>
							<!-- <input type="text" class="text-m" v-if="item.CTRLTYPE == 'ExSearchMatch' " v-model="queryJson[item.FIELDNAME]" @tap="querySearch(item)"
							 :disabled="true" :placeholder=" '请选择' + item.DISPLAYNAME" /> -->

							<picker @change="bindPickerChange($event,item.FIELDNAME,queryJson[item.FIELDNAME+index])" range-key="name" :value="queryJson[`${item.FIELDNAME}index`]" v-if="item.CTRLTYPE == 'ExEnum' "
							 :range="queryJson[item.FIELDNAME+index]">
							 <text >{{ queryJson[item.FIELDNAME+index][queryJson[`${item.FIELDNAME}index`]].name }}  </text>
								<!-- <input type="text" value="" disabled :value="queryJson[item.FIELDNAME+index][queryJson[item.FIELDNAME]]" /> -->
							</picker>
						</view>

					</view>

					<view class="close">
						<button class="cu-btn margin-xs block bg-blue margin-tb-sm lg" @click="querySure('showLeft')">
							查询
						</button>

						<button class="cu-btn margin-xs block margin-tb-sm lg" @click="resetQuery('showLeft')">
							重置
						</button>
					</view>

				</scroll-view>
			</view>
		</uni-drawer>

		<w-picker mode="range" startYear="2017" endYear="2030" :value="rangeVal" :current="true" @confirm="onConfirm($event,'range')"
		 @cancel="onCancel" ref="rangePicker"></w-picker>

	</view>
</template>

<script>
	import wPicker from '@/components/w-picker-v2/w-picker.vue'
	import uniDrawer from '@/components/drawer/uni-drawer.vue'

	export default {
		props: {
			queryJsonConfig: {
				type: Array
			},
			queryJson: {
				type: Object
			}
		},

		data() {
			return {
				showRight: false,
				showLeft: false,
				startTime: '',
				endTime: '',
				timeIndex: 0,
				rangeVal: ['2018-12-12', '2020-04-02'],
				hideDate:false
			}
		},
		components: {
			wPicker,
			uniDrawer
		},
		watch:{
			queryJsonConfig(){
				this.resetStartTime()
			}
		},
		
		mounted() {
			
		},
		methods: {
			// 设置初始时的时间
			resetStartTime(){
				let AAA = {
					0:'all',
					1:0,
					2:-3,
					3:-30
				}
				// console.log(236);
				let SSS  = this.queryJsonConfig.filter(item=>{
					return item.FIELDNAME == 'STIME' ;
				})
				// console.log(SSS);
				if( Array.isArray(SSS) && SSS.length>0){
					if(SSS[0].ISCUSEDIT == 0 ) this.hideDate = true  ;
					this.timeIndex = SSS[0].EXPESSION*1
					this.changeTimeIndex(this.timeIndex,AAA[this.timeIndex] )
				}else{
					this.timeIndex = 0
					this.hideDate = false
				}
			},
			// 打开窗口
			showDrawer(e) {
				this.$refs[e].open()
			},
			// 关闭窗口
			closeDrawer(e) {
				this.$refs[e].close()
				this.$emit('hideModal')
			},
			// 抽屉状态发生变化触发
			change(e, type) {
				this[type] = e
				if(e==false){ this.$emit('hideModal') }
			},

			changeTimeIndex(e,d) {
				// console.log(e,d);
				this.timeIndex = e
				if(d!="all"){
					this.queryJson.StartTime = this.$utils.GetDateAfter(d);
				}else{
					this.queryJson.StartTime = '2000-01-01'
				}
				this.queryJson.EndTime = this.$utils.GetDateAfter(0);
			},

			SetTimeTo() {
				if(this.hideDate) return
				this.$refs.rangePicker.show();
			},

			onConfirm(res, type) {
				let r = res.result.split('至');
				let s = r[0],
					e = r[1];
				this.queryJson.StartTime = s
				this.queryJson.EndTime = e
				// console.log(res);
			},
			onCancel() {

			},

			// 枚举选择
			bindPickerChange(e, id,vv) { // 枚举确定
				let val = e.target.value , cc ='' ;
				if(Array.isArray(vv)  && vv.length > 0){
					cc = vv[val].id
					cc = cc === 'null'?'':cc;
				}
				console.log(22);
				this.$emit('bindPickerChange',{val:cc ,id , index:val})
			},
			// 模糊查询
			querySearch(d) {
				this.$emit('querySearch', d)
			},
			// 执行查询
			querySure(e) {
				this.closeDrawer(e);
				this.$emit('queryEvent')
			},

			resetQuery() {
				this.timeIndex = 0
				this.queryJson.StartTime = '2000-01-01'
				this.$emit('resetQuery')
			}

		}

	}
</script>

<style lang="scss">
	.query-drawer {
		.scroll-view {
			.header {
				padding: 30rpx;
				display: flex;
				justify-content: space-between;
				border-bottom: 1rpx solid #F1F1F1;
			}

			.time {
				padding: 30rpx;
				border-bottom: 1rpx solid #F1F1F1;

				.time-section {
					width: 100%;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin: 18rpx 0;

					button {
						width: 100rpx;
						line-height: 1;
						padding: 14rpx 10rpx;
						font-size: 26rpx;
					}

					button:first-child {
						margin-left: 0;
					}

					button:last-child {
						margin-right: 0;
					}
				}

				.time-to {
					display: flex;
					justify-content: center;
					align-items: center;
					padding-top: 20rpx;

					uni-input {
						display: block;
						text-align: center;
						border: 1rpx solid $uni-border-color;
						background-color: #F8F8F8;
						border-radius: 10rpx;
						font-size: 28rpx;
					}

					text {
						width: 50rpx;
						margin: 0 14rpx;
					}
				}
			}

			.content {
				.content-row {
					padding: 20rpx 26rpx;
					border-bottom: 1rpx solid #F1F1F1;
				}

				.content-row:focus-within {
					border-bottom: 1rpx solid #0164FF;
				}
			}
		}
	}

	.w-picker {
		z-index: 1000 !important;
	}
</style>

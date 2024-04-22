<template>
	<view class="e-container">
		<form @submit="formSubmit" class="login-form">			
			<view class="section" v-for="(item,index) in list" :class="inputIndex==index?'solid-bottom-blue':'' ">
				<view class="section-label flex justify-between">
					<view class="flex-sb">
						服务器地址{{ index+1}}
					</view>
					<view class="text-red" @click="removeEvent(index)">
						<i class='dicon' style="font-size: 40upx;">&#xe937;</i>
					</view>
				</view>
				<input  :name="'ipnum'+ index" type="text" @focus="setActive(index)"  v-model="list[index]"  placeholder="222.133.33.147:8002" 
				 />
			</view>
			<view class="btn-area" hover-class="e-hover-btn">
				<button formType="submit" class="login-btn" type="primary">保存</button>				
			</view>
		</form>
	</view>
</template>

<script>
	let _self;
	let GDIPdata = [
		// {
		// 	name: "远大电信",
		// 	ip: "218.76.167.111:8810",
		// 	isadd: false
		// },
		// {
		// 	name: "远大联通",
		// 	ip: "42.48.136.54:8820",
		// 	isadd: false
		// }
	];
	export default {
		data() {
			return {
				list:['56.befar.com'],
				inputIndex:'',
			};
		},
		onNavigationBarButtonTap(e) {
			_self.list.push('');
		},
		onShow:function(){
			let that = this;
			uni.getStorage({
					key: 'ipListStr',
					success: function (res) {
							_self.list = JSON.parse(res.data);
					}
			});
			
		},	
		onLoad: function() {
			_self=this;
		},
		methods:{
			setActive(i){
				// console.log(i);
				_self.inputIndex = i 
			},
			removeEvent: function(e){
				//console.log(_self.list);
				if(_self.list.length == 1){
					uni.showToast({
						title: '请至少配置一个服务器地址。',
						icon: 'none',
						duration: 1000
					});
					return;
				}
				_self.list.splice(e,1)
				// console.log(_self.list);
			},
			getValue:function(e,i){
				 let val = e.target.value;
				_self.list[i] = val;
				console.log(val);
			},
			formSubmit: function(e) {
				
				let ipList = e.detail.value ;
				let ipListStr = JSON.stringify(_self.list);
				console.log(789,ipList);
				return ;
				console.log(789,ipList);
				if(_self.list.length < 1){
					uni.showToast({
						title: '请至少配置一个服务器地址。',
						icon: 'none',
						duration: 1000
					});
					return;
				}else if(!ipList.ipnum0){
					return uni.showToast({
						title: '第一项配置不能为空',
						icon: 'none',
						duration: 1000
					});
				}
				let isNull = true,nullIndex ;
				_self.list.forEach( (item,index)=>{
					if(item=='') {
						isNull = false 
						nullIndex =  index+1 ;
						return ;
					}
				})
				if(!isNull) return utils.tips('服务器地址'+nullIndex+'配置不能为空');
				
				uni.showLoading({})
				console.log(ipListStr);

				uni.setStorage({
					key: 'ipListStr',
					data: ipListStr
				});
				
				uni.showToast({
					title: '保存成功',
					icon: 'none',
					duration: 1000
				});
				setTimeout(function(){ 
					uni.navigateBack({ })
				}, 1200);
				
			}
		}
	}
</script>

<style scoped="">
	.section {
		margin: 40upx;
		border-bottom: 2upx solid #aaa;
	}
	.btn-area {
		margin: 60upx 40upx 0upx 40upx;
	}
</style>

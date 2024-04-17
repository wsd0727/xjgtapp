function axios(params) {
	let {
		method,
		url,
		data,
		token,
		isLoading
	} = params;
	token = token || '';
	method = method || 'POST';
	data = data || {};
	// 是否需要执行加载中
	if(isLoading){
		uni.showLoading({
			title:'加载中...',
			mask:true
		})
	}
	// console.log(params);
	// 地址不存在时拦截
	if (!url) return uni.showToast({
		title: '请求地址无效，请确认',
		icon: 'none'
	});
	return new Promise((resolve, reject) => {
		uni.request({
			url: url,
			method: method,
			data: data,
			header: { Authorization:'BasicAuth '+token },
			success: (res) => {
				console.log(res)
				// 延时取消加载中动画
				uni.hideLoading()
				// setTimeout(() => {
				// 	uni.hideLoading()
				// }, 500)
				if (res.statusCode == 401) {
					uni.showToast({
						title: '权限已失效，请重新登录。',
						icon: 'none'
					})
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/tab05/login'
						})
					}, 1500)
					reject();
					return;
				} else if (res.statusCode != 200) {
					uni.showToast({
						title: '请求失败：状态码=' + res.statusCode + '->错误原因=' + res.Message,
						icon: 'none',
						duration: 2500
					})
					reject();
					return;
				} else if (!res.data.IsSuccess) {
					uni.showToast({
						title: '请求失败：' + res.data.Message,
						icon: 'none',
						duration: 2500
					})
					reject();
					return;
				}
				// console.log('走进封装的axios');
				if(!res.data.Message) res.data.Message = '';
				resolve(res.data)
			},
			fail: (err) => {
				console.log(err);
				uni.hideLoading()
				uni.showToast({
					title: '网络异常或服务异常：' + err.errMsg,
					icon: 'none'
				})
				reject(err)
				return;
			}
		})
	})
}

module.exports = {
	axios
}

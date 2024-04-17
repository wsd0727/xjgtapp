var isIos
// #ifdef APP-PLUS
isIos = (plus.os.name == "iOS")
// #endif
const CryptoJS = require('./crypto-js.min.js')
function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}
	var hour = parseInt(time / 3600)
	time = time % 3600
	var minute = parseInt(time / 60)
	time = time % 60
	var second = time

	return ([hour, minute, second]).map(function(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}).join(':')
}

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

function getBaseUrl() {
	let BaseUrl;
	uni.getStorage({
		key: 'baseUrl',
		success: function(res) {
			BaseUrl = res.data;
		}
	});
}
// 获取今天的日期
function getToDay() {
	const date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	month = month > 9 ? month : '0' + month;;
	day = day > 9 ? day : '0' + day;
	return `${year}-${month}-${day}`;
}

// 获取多少天后的日期
function GetDateAfter(AddDayCount) {
	var AddDayCount = parseInt(AddDayCount);
	var dd = new Date();
	dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期 
	var y = dd.getFullYear();
	var m = dd.getMonth() + 1; //获取当前月份的日期 
	var d = dd.getDate();

	function checkT(s) {
		return s < 10 ? '0' + s : s;
	}
	return y + "-" + checkT(m) + "-" + checkT(d);
}


// 身份证号验证
var aCity = {
	11: "北京",
	12: "天津",
	13: "河北",
	14: "山西",
	15: "内蒙古",
	21: "辽宁",
	22: "吉林",
	23: "黑龙江",
	31: "上海",
	32: "江苏",
	33: "浙江",
	34: "安徽",
	35: "福建",
	36: "江西",
	37: "山东",
	41: "河南",
	42: "湖北",
	43: "湖南",
	44: "广东",
	45: "广西",
	46: "海南",
	50: "重庆",
	51: "四川",
	52: "贵州",
	53: "云南",
	54: "西藏",
	61: "陕西",
	62: "甘肃",
	63: "青海",
	64: "宁夏",
	65: "新疆",
	71: "台湾",
	81: "香港",
	82: "澳门",
	91: "国外"
}

function isCardID(sId) {
	var iSum = 0;
	var info = "";
	if (!/^\d{17}(\d|x)$/i.test(sId)) return "身份证长度或格式错误";
	sId = sId.replace(/x$/i, "a");
	if (aCity[parseInt(sId.substr(0, 2))] == null) return "身份证地区非法";
	var sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
	var d = new Date(sBirthday.replace(/-/g, "/"));
	if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) return "身份证上的出生日期非法";
	for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11);
	if (iSum % 11 != 1) return "身份证号非法";
	//aCity[parseInt(sId.substr(0,2))]+","+sBirthday+","+(sId.substr(16,1)%2?"男":"女");//此次还可以判断出输入的身份证号的人性别
	return true;
}
// 手机号验证
function isMobile(tel) {
	var regex = /0?(13|14|15|16|17|18|19)[0-9]{9}/;
	if (!regex.test(tel)) return "手机号格式错误！";
	return true;
}
// 中文姓名验证
function isChines(name) {
	var regex = /[\u4e00-\u9fa5]/;
	if (!regex.test(name)) return false;
	return true;
}
// 车牌号验证
function isCarNumber(car) {
	var result = false;
	if (car.length == 7) {
		var regex =
			'^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$';
		result = regex.test(car);
	}
	return result;
}
// 验证正整数
function isInteger(e) {
	var regex = /^[1-9]\d*$/;
	if (!regex.test(e)) {
		return false;
	} else {
		return true;
	}
}
// 大于= 0的数字，包含小数
function isIntNum(e) {
	var regex = /^[0-9]\d*(\.\d+)?$/;
	if (!regex.test(e)) {
		return false;
	} else {
		return true;
	}
}
// 判断参数是否已经存在数组内      存在false   不存在true
function checkArray(e, Arrays) {
	let flag = true;
	for (let i in Arrays) {
		if (e == Arrays[i]) {
			return false;
		}
	}
	return flag;
}

function hideBirthday(e) {
	var idcard = '';
	if (e) {
		idcard = e.replace(/^(.{6})(?:\d+)(.{4})$/, "$1****$2");
	}
	return idcard;
}

// 获取表单数据  
function getValueByclass(getVal, getHtm) {
	let myobject = {};
	if (getVal) {
		let formID = document.getElementsByClassName(getVal);
		for (var i = 0; i < formID.length; i++) {
			let oneId = formID[i].id;
			myobject[oneId] = document.getElementById(oneId).value;
		}
	}
	if (getHtm) {
		let formID2 = document.getElementsByClassName(getHtm);
		for (var i = 0; i < formID2.length; i++) {
			let oneId2 = formID2[i].id;
			myobject[oneId2] = document.getElementById(oneId2).innerHTML;
		}
	}
	return myobject;
}

function getRules(data) {
	let rule = [];
	for (var i = 0; i < data.length; i++) {
		let t = {}; // ISQUERYSORT
		t.name = data[i].FIELDNAME;
		t.checkType = 'notnull' // data[i].FIELDTYPE
		t.checkRule = '';
		t.errorMsg = data[i].DISPLAYNAME + '不能为空或格式错误';

		if (data[i].ISREQUESTED == 1) {
			// console.log(data[i].EXPESSION);
			let length = data[i].EXPESSION.length;
			let firstIndex = data[i].EXPESSION.indexOf('|');
			let regulars = data[i].EXPESSION.substr(firstIndex + 1, length);
			let isReg = data[i].EXPESSION.substr(0, firstIndex) == "Regular" ? true : false;
			// console.log(length,firstIndex,regulars);			
			if (isReg) {
				t.checkType = regulars;
				// t.checkRule =   data[i].EXPESSION.substr(firstIndex+1,length);
				console.log(regulars);
			}
			rule.push(t);
		}

	}
	// console.log(rule);
	return rule;
}
// 获取url 后面的参数 
function getUrlParamteter(url) {
	let reg = /([^&?=]+)=([^&?=]+)/g,
		obj = {};
	url.replace(reg, function() {
		obj[arguments[1]] = arguments[2];
	})
	return obj;
}

function forMatNum(num) {
	return num < 10 ? '0' + num : num + '';
}

function initDays(year, month) {
	let totalDays = new Date(year, month, 0).getDate();
	let dates = [];
	for (let d = 1; d <= totalDays; d++) {
		dates.push(forMatNum(d));
	};
	return dates;
}

function initPicker(start, end, mode = "date", step, value, flag) {
	let aToday = new Date();
	let tYear, tMonth, tDay, tHours, tMinutes, tSeconds, defaultVal = [];
	let initstartDate = new Date(start);
	let endDate = new Date(end);
	if (start > end) {
		initstartDate = new Date(end);
		endDate = new Date(start);
	};
	let startYear = initstartDate.getFullYear();
	let startMonth = initstartDate.getMonth() + 1;
	let endYear = endDate.getFullYear();
	let years = [],
		months = [],
		days = [],
		hours = [],
		minutes = [],
		seconds = [],
		returnArr = [];
	let curMonth = flag ? value[1] * 1 : (value[1] + 1);
	let totalDays = new Date(startYear, curMonth, 0).getDate();
	for (let s = startYear; s <= endYear; s++) {
		years.push(s + '');
	};
	for (let m = 1; m <= 12; m++) {
		months.push(forMatNum(m));
	};
	for (let d = 1; d <= totalDays; d++) {
		days.push(forMatNum(d));
	}
	for (let h = 0; h < 24; h++) {
		hours.push(forMatNum(h));
	}
	for (let m = 0; m < 60; m += step * 1) {
		minutes.push(forMatNum(m));
	}
	for (let s = 0; s < 60; s++) {
		seconds.push(forMatNum(s));
	}
	if (flag) {
		returnArr = [
			years.indexOf(value[0]),
			months.indexOf(value[1]),
			days.indexOf(value[2]),
			hours.indexOf(value[3]),
			minutes.indexOf(value[4]) == -1 ? 0 : minutes.indexOf(value[4]),
			seconds.indexOf(value[5])
		]
	};
	switch (mode) {
		case "range":
			if (flag) {
				defaultVal = [returnArr[0], returnArr[1], returnArr[2], 0, returnArr[0], returnArr[1], returnArr[2]];
				return {
					years,
					months,
					days,
					defaultVal
				}
			} else {
				return {
					years,
					months,
					days
				}
			}
			break;
		case "date":
			if (flag) {
				defaultVal = [returnArr[0], returnArr[1], returnArr[2]];
				return {
					years,
					months,
					days,
					defaultVal
				}
			} else {
				return {
					years,
					months,
					days
				}
			}
			break;
		case "yearMonth":
			if (flag) {
				defaultVal = [returnArr[0], returnArr[1]];
				return {
					years,
					months,
					defaultVal
				}
			} else {
				return {
					years,
					months
				}
			}
			break;
		case "dateTime":
			if (flag) {
				defaultVal = returnArr;
				return {
					years,
					months,
					days,
					hours,
					minutes,
					seconds,
					defaultVal
				}
			} else {
				return {
					years,
					months,
					days,
					hours,
					minutes,
					seconds
				}
			}
			break;
		case "time":
			if (flag) {
				defaultVal = [returnArr[3], returnArr[4], returnArr[5]];
				return {
					hours,
					minutes,
					seconds,
					defaultVal
				}
			} else {
				return {
					hours,
					minutes,
					seconds
				}
			}
			break;
	}
}
// 延迟关闭加载中动画
function delayHide() {
	setTimeout(function() {
		uni.hideLoading();
	}, 1500);
}

/**
 * 获取指定日期的周的第一天、月的第一天、季的第一天、年的第一天
 * @param date new Date()形式，或是自定义参数的new Date()
 * @returns 返回值为格式化的日期，yy-mm-dd
 */
//日期格式化，返回值形式为yy-mm-dd
function timeFormat(date) {
	if (!date || typeof(date) === "string") {
		this.error("参数异常，请检查...");
	}
	var y = date.getFullYear(); //年
	var m = date.getMonth() + 1; //月
	var d = date.getDate(); //日
	m = m < 10 ? '0' + m : m;
	d = d < 10 ? '0' + d : d;
	return y + "-" + m + "-" + d;
}

//获取这周的周一
function getFirstDayOfWeek(date) {
	var weekday = date.getDay() || 7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
	date.setDate(date.getDate() - weekday + 1); //往前算（weekday-1）天，年份、月份会自动变化
	return timeFormat(date);
}
//获取当月第一天
function getFirstDayOfMonth(date) {
	date.setDate(1);
	return timeFormat(date);
}

//获取当季第一天
function getFirstDayOfSeason(date) {
	var month = date.getMonth();
	if (month < 3) {
		date.setMonth(0);
	} else if (2 < month && month < 6) {
		date.setMonth(3);
	} else if (5 < month && month < 9) {
		date.setMonth(6);
	} else if (8 < month) {
		date.setMonth(9);
	}
	date.setDate(1);
	return timeFormat(date);
}

//获取当年第一天
function getFirstDayOfYear(date) {
	date.setDate(1);
	date.setMonth(0);
	return timeFormat(date);
}
// 设置单据状态
function setStatus(data, value) {
	return setFormat(data, value);
}

// 格式化列表数据
function setFormat(e, value, data) {
	// e 配置中EXPESSION  , value是数据中值  data 为整条配置数据
	value = value + '';
	// console.log(value);
	if (value == 'null' || value == 'undefined') {
		return '';
	} else if (!e) {
		return value;
	}
	// console.log(e,value);
	// let Arrays = e.split('$');
	let color = '',
		text = '',
		status = '';
	let t = e.split('|');
	if (t[0] == 'FORMAT') {
		let keys = t[1].split(';');
		keys.forEach(items => {
			let textItem = data[items] ? data[items] : '';
			textItem += '		|		';
			text += textItem
		})
		return text = text.slice(0, text.lastIndexOf('|'));
	} else if (t[0] == 'Enum') {
		let t1 = t[1].split(';');
		t1.forEach((items, i) => {
			let a = items.split('-');
			if (a[0] == value) {
				return text = a[1];
			}
		})
	} else if (t[0] == 'UNIT') {
		return text = value + ' ' + t[1];
	}
	return text;

}

function openGPS() {
	let system = uni.getSystemInfoSync(); // 获取系统信息
	// console.log(JSON.stringify(system));
	if (system.platform === 'android') { // 判断平台
		var context = plus.android.importClass("android.content.Context");
		var locationManager = plus.android.importClass("android.location.LocationManager");
		var main = plus.android.runtimeMainActivity();
		var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
		if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
			uni.showModal({
				title: '重要提示',
				content: '为保证服务，请开启GPS定位服务功能！',
				showCancel: true, // 不显示取消按钮
				success(res) {
					if (res.cancel) {
						return plus.runtime.quit();
					}
					if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
						var Intent = plus.android.importClass('android.content.Intent');
						var Settings = plus.android.importClass('android.provider.Settings');
						var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
						main.startActivity(intent); // 打开系统设置GPS服务页面
					} else {
						console.log('GPS功能已开启');
					}
				}
			});
		}
	}

}


function openAllGPS(isIos) {
	let content = isIos ? "为保证签到成功，请打开系统设置->隐私->定位服务->开启定位服务" :
		"为保证签到成功，请务必开启GPS定位服务！"
	uni.showModal({
		title: '警告',
		content: content,
		showCancel: false, // 不显示取消按钮
		success(res) {
			if (res.cancel) {
				return plus.runtime.quit();
			}
			if (isIos) {
				var UIApplication = plus.ios.import("UIApplication");
				var application2 = UIApplication.sharedApplication();
				var NSURL2 = plus.ios.import("NSURL");
				// var setting2 = NSURL2.URLWithString("prefs:root=LOCATION_SERVICES");		
				var setting2 = NSURL2.URLWithString("app-settings:");
				application2.openURL(setting2);

				plus.ios.deleteObject(setting2);
				plus.ios.deleteObject(NSURL2);
				plus.ios.deleteObject(application2);
			} else {
				var Intent = plus.android.importClass('android.content.Intent');
				var Settings = plus.android.importClass('android.provider.Settings');
				var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
				main.startActivity(intent); // 打开安卓系统设置GPS服务页面
			}
		}
	});
}


// 上传GPS 坐标
function uploadGps(baseUrl, userName, userId) {
	uni.getLocation({
		type: 'gcj02',
		success: function(result) {
			// console.log(JSON.stringify(result));
			// result.latitude,result.longitude
			let data = {
				"Account": userName,
				"UserId": userId,
				"Longitude": result.longitude,
				"Latitude": result.latitude
			}
			// console.log(data);
			uni.request({
				url: baseUrl + '/api/Common/GspLocation', // api.apiPublic.GspLocation,
				method: 'POST',
				data: data,
				success: function(res) {
					// console.log(res.data);
				}
			})

		}
	});
}

function runUploadGps(baseUrl, userName, userId) {
	// console.log(baseUrl,userName,userId);
	setInterval(function() {
		// console.log(new Date());
		uploadGps(baseUrl, userName, userId);
	}, 60000)
}


function strToArray(str) {
	// console.log(str);
	if (!str && str.length < 1) {
		return [];
	}
	let arr = str.split(';');
	let tnt = arr.map((item, index) => {
		let a = item.split('-');
		let b = {};
		b.id = a[0];
		b.name = a[1];
		return b;
	})
	let t = str.split(';');
	if (!str.slice(str.lastIndexOf(';') + 1, -1)) {
		tnt.pop();
	}
	return tnt;
}

function speak(contents) {
	var speaktext = contents; //传入的值是需要播报的内容
	switch (plus.os.name) {
		case "iOS":
			// console.log(speaktext);
			var AVSpeechSynthesizer = plus.ios.importClass("AVSpeechSynthesizer");
			var AVSpeechUtterance = plus.ios.importClass("AVSpeechUtterance");
			var AVSpeechSynthesisVoice = plus.ios.import("AVSpeechSynthesisVoice");
			var sppech = new AVSpeechSynthesizer();
			var voice = AVSpeechSynthesisVoice.voiceWithLanguage("zh-CN");
			var utterance = AVSpeechUtterance.speechUtteranceWithString(speaktext);
			utterance.setVoice(voice);
			sppech.speakUtterance(utterance);
			plus.ios.deleteObject(voice);
			plus.ios.deleteObject(utterance);
			plus.ios.deleteObject(sppech);
			break;
		case "Android":
			if (parseInt(plus.os.version) >= 8) {
				/* console.log(plus.os.version);
				var timestamp = Date.parse(new Date());  
					if(!plus.storage.getItem("oneTime")){  
							getBaiDuToken(msg.content); //获取百度token  
							plus.storage.setItem("oneTime",JSON.stringify(timestamp));  
					}else{  
							var oneTime = plus.storage.getItem("oneTime");  
							if((parseInt(timestamp)-parseInt(oneTime)) > 24*60*60){ //因为token24小时后过期,重新获取一次  
									console.log("大于24小时");  
									plus.storage.setItem("oneTime",JSON.stringify(timestamp)); //大于24小时就更新,再次获取token  
									getBaiDuToken(msg.content); //获取百度token  
							}else{  
									//小于24小时无需重新获取百度token  
									console.log("小于24小时");  
									baiduAubio(msg.content);  
							}  
					} */
			} else {
				var main = plus.android.runtimeMainActivity();
				var SpeechUtility = plus.android.importClass("com.iflytek.cloud.SpeechUtility");
				SpeechUtility.createUtility(main, "appid=53feacdd");
				var SynthesizerPlayer = plus.android.importClass("com.iflytek.cloud.SpeechSynthesizer");
				var play = SynthesizerPlayer.createSynthesizer(main, null);
				play.startSpeaking(speaktext, null);
			}
			break;
	}


}

// 弹出协议
function openProtocol(url, titles) {
	uni.request({
		url: url,
		method: 'POST',
		success: function(result) {
			if (result.statusCode == 200 && result.data.IsSuccess) {
				let main = result.data.Result;
				uni.showModal({
					title: titles || '提示',
					content: main,
					success: function(res) {

					}
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: '请求错误' + result.data.Message
				})
			}
		}
	})
}

// 获取当天的上个月的今天 或者下个月的今天
function getXmonthToday(type) {
	// type 0 是当天 -1 是上个月   1是下个月
	var now = new Date(); // 可以传值调式 now = new Date(2019,2,30); 今天是3月30号
	var year = now.getFullYear(); //getYear()+1900=getFullYear()
	var month = now.getMonth() + 1; //0-11表示1-12月
	var day = now.getDate(); // 当天日期
	if (parseInt(month) < 10) {
		month = "0" + month;
	}
	if (parseInt(day) < 10) {
		day = "0" + day;
	}
	now = year + '-' + month + '-' + day; // 如果取当月日期可直接 return 返回

	var preMonth = parseInt(month) - 1;
	preMonth = preMonth < 10 ? '0' + preMonth : preMonth; // 获取上个月的值
	var nextMonth = parseInt(month) + 1;
	nextMonth = nextMonth < 10 ? '0' + nextMonth : nextMonth; // 获取下个月个月的值

	if (parseInt(month) == 1 && type == -1) { //如果是1月份，要上个月 ，则取上一年的12月份
		return (parseInt(year) - 1) + '-12-' + day;
	} else if (parseInt(month) == 12 && type == 1) { // 如果是12月，要下个月，取下一年的1月
		return (parseInt(year) + 1) + '-01-' + day;
	}

	var preSize = new Date(year, parseInt(month) - 1, 0).getDate(); //上月总天数
	var nextSize = new Date(year, parseInt(month) + 1, 0).getDate(); //下月总天数
	// console.log(preSize, nextSize)
	if (preSize < parseInt(day) && type == -1) { // 取上个月，如果上个月总天数小于本月今天，取上个月最后一天    
		return year + '-' + preMonth + '-' + preSize;
	} else if (nextSize < parseInt(day) && type == 1) { // 如果下个月总天数小于本月今天，取下个月最后一天  
		return year + '-' + nextMonth + '-' + nextSize;
	}

	if (type == -1) {
		return year + '-' + preMonth + '-' + day;
	} else if (type == 1) {
		return year + '-' + nextMonth + '-' + day;
	} else if (type == 0) {
		return now;
	}
}
// 计算润年 
function isLeapYear(year) {
	return (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);
}
// 重置默认日期
function setDefaultDate(type, num) {
	// type 0 是当天  , m 是月分，y 是年份  type 某个月的今天 
	var now = new Date(); // 可以传值调式 now = new Date(2019,2,30); 今天是3月30号
	var year = now.getFullYear(); //getYear()+1900=getFullYear()
	var month = now.getMonth() + 1; //0-11表示1-12月
	var day = now.getDate(); // 当天日期
	var num = parseInt(num);
	if (parseInt(month) < 10) {
		month = "0" + month;
	}
	if (parseInt(day) < 10) {
		day = "0" + day;
	}

	if (type == 0) {
		return year + '-' + month + '-' + day;
	} // 如果取当月日期可直接 return 返回

	if (type == 'Y') {
		var resYear = year + num; // 计算后的年 
		if (parseInt(month) == 2) { // 如果是2月，是平年 ，今天又是2/29日 ，日期设置为28号
			if (!isLeapYear(resYear) && parseInt(day) == 29) { // 判断是否是闰年 2月是29天。
				day = 28;
			}
		}
		return resYear + '-' + month + '-' + day;
	} else if (type == 'M') {
		var resMonth = parseInt(month) + parseInt(num); // 计算后的月数
		// preMonth = preMonth < 10 ? '0' + preMonth : preMonth;
		if (resMonth > 0 && resMonth > 12) {
			var newYear = year + 1;
			var newMonth = resMonth - 12;
			var allDayNum = new Date(newYear, newMonth, 0).getDate(); // 该月的总天数
			newMonth = newMonth < 10 ? '0' + newMonth : newMonth;
			if (allDayNum < parseInt(day)) { // 该月最大天数小于今天
				return newYear + '-' + newMonth + '-' + allDayNum;
			}
			newMonth
			return newYear + '-' + newMonth + '-' + day;
		} else if (resMonth > 0 && resMonth < 13) {
			resMonth = resMonth < 10 ? '0' + resMonth : resMonth;
			var allDayNum = new Date(year, resMonth, 0).getDate(); // 该月的总天数
			if (allDayNum < parseInt(day)) { // 该月最大天数小于今天
				return year + '-' + resMonth + '-' + allDayNum;
			}
			return year + '-' + resMonth + '-' + day;
		} else if (resMonth < 0) {
			var newYear = year - 1;
			var newMonth = resMonth + 12; // 计算后的月份
			var allDayNum = new Date(newYear, newMonth, 0).getDate(); // 该月的总天数
			newMonth = newMonth < 10 ? '0' + newMonth : newMonth;
			if (allDayNum < parseInt(day)) { // 该月最大天数小于今天
				return newYear + '-' + newMonth + '-' + allDayNum;
			}
			return newYear + '-' + newMonth + '-' + day;
		}
	}
}

function resolveDate(data) {
	data = data.replace('}', '');
	let	mdate = '', dateTime = '';
	if (data.indexOf("{CurrentDateTime|") > -1) {
		let dtval = data.split('|');
		if (dtval[1].indexOf('M') > -1) {
			let type = dtval[1].replace('M', '');
			mdate = setDefaultDate('M', type);
		} else if (dtval[1].indexOf('D') > -1) {
			let type = dtval[1].replace('D', '');
			mdate = GetDateAfter(type);
		} else if (dtval[1].indexOf('Y') > -1) {
			let type = dtval[1].replace('Y', '');
			mdate = setDefaultDate('Y', type);
		}
		dateTime = dtval[2] ? mdate + ' ' + dtval[2] : mdate + ''
	}
	return dateTime;
}
// 计算坐标距离
function Rad(d) {
	return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
}

function GetDistance(lat1, lng1, lat2, lng2) {
	var radLat1 = Rad(lat1);
	var radLat2 = Rad(lat2);
	var a = radLat1 - radLat2;
	var b = Rad(lng1) - Rad(lng2);
	var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
		Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	s = s * 6378.137; // EARTH_RADIUS;
	s = Math.round(s * 10000) / 10000; //输出为公里
	//s=s.toFixed(4);
	return s * 1000;
}

function judgeSign(allPark, lat, lon) { // 计算坐标距离
	// console.log(lat,lon);
	let status = false,
		carParkLast, err = '未知错误';
	if (allPark.carParkList.length < 1) {
		return {
			ok: false,
			err: '未匹配到停车场'
		};
	};
	let firstDistance = 0,
		distance = [],
		getIndex = 0,
		myRADIUS;

	allPark.carParkList.forEach((item, index) => {
		if (item.PK_ORG == allPark.PK_ORG) {
			// 属于该停车场
			let tt = GetDistance(lat, lon, item.LATITUDE, item.LONGITUDE);
			console.log(tt, item.RADIUS);
			if (tt < item.RADIUS) { // 在允许签到范围内
				distance.push(tt);
				status = true;
				item.myRADIUS = tt;
				getIndex = index;
				err = '';
				// console.log(distance);
				if (index != 0 && distance[index] < distance[index - 1]) {
					getIndex = index;
					carParkLast = item;
					item.myRADIUS = tt;
					err = '';
				}
			} else {
				err = '签到失败：未在停车场签到范围内。';
			}
		} else if (distance.length < 1 && item.PK_ORG != allPark.PK_ORG) {
			status = false
			err = '未匹配到该组织下的停车场';
		}
	})
	let b = allPark.carParkList[getIndex];
	// console.log(getIndex);
	// console.log(distance);
	return {
		ok: status,
		item: b,
		err: err
	};



}

function tips(t,time=3000) {
	uni.showToast({
		title: t,
		icon: 'none',
		duration: time
	})
}

function showLoading() {
	uni.showLoading({
		title: '加载中...',
		mask: true
	})
}

// 获取更新
function handleUpdate(baseUrl, token) {
	let version = plus ? plus.runtime.version : '0';
	let dcType = plus.os.name == 'iOS' ? 2 : 0;
	// console.log(dcType,baseUrl);
	uni.request({
		url: baseUrl + '/api/Common/UpdateVersion',
		data: {
			VERTYPE: dcType
		},
		method: 'POST',
		header: {
			Authorization: 'BasicAuth ' + token
		},
		success: function(res) {
			// console.log(JSON.stringify(res));
			// console.log(JSON.stringify(res)) http://139.129.206.158:8207/APK/1.1.0.apk
			if (res.statusCode == 200 && res.data.IsSuccess) {
				// console.log(JSON.stringify(res));
				let result = res.data.Result[0];
				if(!result) return ;
				let titles = '请更新该版本！';
				let openUrl = baseUrl + '/' + result.VERURL;
				// let openUrl = 'http://121.28.141.37:8001/APK/SG1.11.190225.apk';
				let message = result.VERMEMO || "更新说明";
				let newVersion = result.VCODE;
				getApp().globalData.aboutUS = result.AboutUs
				getApp().globalData.phone = result.Phone
				if(newVersion== '1.0.0' && dcType == 2) { return }
				if (newVersion != version) {
					updateApp(openUrl, message, titles)
				} else {
					utils.speak('您已经是最新版本')
					return uni.showToast({
						title: '您已经是最新版本',
						icon: 'none'
					})
				}
			}
		}
	})
}

function updateApp(downUrl, message, titles) {
	// console.log(downUrl,message,titles)
	uni.showModal({ //提醒用户更新  
		title: titles,
		showCancel: true,
		content: message,
		success: (res) => {
			if (res.confirm) {
				let iosURL = 'https://apps.apple.com/cn/app/id1477792996';
				if (plus.os.name == 'iOS') {
					return plus.runtime.openURL(iosURL);
				}
				uni.showLoading({
					title: '下载中...',
					mask: true
				})
				// plus.runtime.openURL(downUrl);
				console.log(downUrl)
				var dtask = plus.downloader.createDownload(downUrl, {}, function(d, status) {
					// 下载完成 
					console.log(d, status)
					if (status == 200) {
						uni.hideLoading();
						plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename), {}, {}, function(error) {
							uni.showToast({
								title: '安装失败',
								mask: false,
								duration: 1500
							});
						})
					} else {
						uni.showToast({
							title: '更新失败',
							mask: false,
							duration: 1500
						});
					}
				});
				dtask.start();
			}
		}
	})
}

function aesJmEncrypt(text) {
	var aseKey =
		"\x65\x6f\x73\x69\x6e\x65\x63\x6f\x6d\x65\x6f\x73\x69\x6e\x65\x63\x6f\x6d\x65\x6f\x73\x69\x6e\x65\x63\x6f\x6d\x65\x6f\x73\x69\x6e";
	var encrypt = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(aseKey), {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	}).toString();
	return encrypt;
}


// 跳转到**应用**的权限页面
function gotoAppPermissionSetting() {
	if (isIos) {
		var UIApplication = plus.ios.import("UIApplication");
		var application2 = UIApplication.sharedApplication();
		var NSURL2 = plus.ios.import("NSURL");
		// var setting2 = NSURL2.URLWithString("prefs:root=LOCATION_SERVICES");		
		var setting2 = NSURL2.URLWithString("app-settings:");
		application2.openURL(setting2);

		plus.ios.deleteObject(setting2);
		plus.ios.deleteObject(NSURL2);
		plus.ios.deleteObject(application2);
	} else {
		console.log(plus.device.vendor);
		var Intent = plus.android.importClass("android.content.Intent");
		var Settings = plus.android.importClass("android.provider.Settings");
		var Uri = plus.android.importClass("android.net.Uri");
		var mainActivity = plus.android.runtimeMainActivity();
		var intent = new Intent();
		intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
		var uri = Uri.fromParts("package", mainActivity.getPackageName(), null);
		intent.setData(uri);
		mainActivity.startActivity(intent);
	}
}

// 设置页面标题
function setPageTitle(d) {
	uni.setNavigationBarTitle({
		title: d
	});
}

module.exports = {
	formatTime: formatTime,
	formatLocation: formatLocation,
	dateUtils: dateUtils,
	getToDay,
	GetDateAfter,
	isCardID,
	isMobile,
	hideBirthday,
	checkArray,
	isIntNum,
	isInteger,
	isMobile,
	isChines,
	getRules,
	getUrlParamteter,
	getValueByclass,
	initDays,
	initPicker,
	delayHide,
	getFirstDayOfWeek,
	getFirstDayOfMonth,
	getFirstDayOfSeason,
	getFirstDayOfYear,
	setStatus,
	setFormat,
	openGPS,
	strToArray,
	speak,
	runUploadGps,
	openProtocol,
	getXmonthToday,
	resolveDate,
	setDefaultDate,
	judgeSign,
	tips,
	showLoading,
	handleUpdate,
	gotoAppPermissionSetting,
	openAllGPS,
	setPageTitle,
	GetDistance,
	aesJmEncrypt
}

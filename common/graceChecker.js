/**
数据验证（表单验证）
来自 grace.hcoder.net 
作者 hcoder 深海

版权声明 : 
GraceUI 的版权约束是不能转售或者将 GraceUI 直接发布到公开渠道！
侵权必究，请遵守版权约定！
*/
module.exports = {
	error:'',
	check : function (data, rule){
		for(var i = 0; i < rule.length; i++){
			if (!rule[i].checkType){return true;}
			if (!rule[i].name) {return true;}
			if (!rule[i].errorMsg) {return true;}
			if (!data[rule[i].name]) {this.error = rule[i].errorMsg; return false;}
			switch (rule[i].checkType){
				case 'string':
					var reg = new RegExp('^.{' + rule[i].checkRule + '}$');
					if(!reg.test(data[rule[i].name])) {this.error = rule[i].errorMsg; return false;}
				break;
				case 'int':
					var reg = new RegExp('^(-[1-9]|[1-9])[0-9]{' + rule[i].checkRule + '}$');
					if(!reg.test(data[rule[i].name])) {this.error = rule[i].errorMsg; return false;}
					break;
				break;
				case 'between':
					if (!this.isNumber(data[rule[i].name])){
						this.error = rule[i].errorMsg;
						return false;
					}
					var minMax = rule[i].checkRule.split(',');
					minMax[0] = Number(minMax[0]);
					minMax[1] = Number(minMax[1]);
					if (data[rule[i].name] > minMax[1] || data[rule[i].name] < minMax[0]) {
						this.error = rule[i].errorMsg;
						return false;
					}
				break;
				case 'betweenD':
					var reg = /^-?[1-9][0-9]?$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
					var minMax = rule[i].checkRule.split(',');
					minMax[0] = Number(minMax[0]);
					minMax[1] = Number(minMax[1]);
					if (data[rule[i].name] > minMax[1] || data[rule[i].name] < minMax[0]) {
						this.error = rule[i].errorMsg;
						return false;
					}
				break;
				case 'betweenF': 
					var reg = /^-?[0-9][0-9]?.+[0-9]+$/;
					if (!reg.test(data[rule[i].name])){this.error = rule[i].errorMsg; return false;}
					var minMax = rule[i].checkRule.split(',');
					minMax[0] = Number(minMax[0]);
					minMax[1] = Number(minMax[1]);
					if (data[rule[i].name] > minMax[1] || data[rule[i].name] < minMax[0]) {
						this.error = rule[i].errorMsg;
						return false;
					}
				break;
				case 'same':
					if (data[rule[i].name] != rule[i].checkRule) { this.error = rule[i].errorMsg; return false;}
				break;
				case 'notsame':
					if (data[rule[i].name] == rule[i].checkRule) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'email':
					var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'Email':
					var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'phoneno':
					var reg = /^1[0-9]{10,10}$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'Integer':  // 正整数
					var reg = /^[1-9]\d*$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'PhoneNo':  // 手机号
					var reg = /0?(13|14|15|16|17|18|19)[0-9]{9}/;
					if (!reg.test(data[rule[i].name])) { this.error = '手机号格式错误！'; return false; }
				break;
				case 'Int':  // 小数
					var reg = /^[0-9]\d*(\.\d+)?$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'zipcode':
					var reg = /^[0-9]{6}$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'Chines':
					var reg = /[\u4e00-\u9fa5]/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'IdCard':
					var reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'CarId':
					var reg = /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/;
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'reg':
				var reg = new RegExp(rule[i].checkRule);
				
				// console.log(reg);
					if (!reg.test(data[rule[i].name])) { this.error = rule[i].errorMsg; return false; }
				break;
				case 'in':
					if(rule[i].checkRule.indexOf(data[rule[i].name]) == -1){
						this.error = rule[i].errorMsg; return false;
					}
				break;
				case 'notnull':
					if(data[rule[i].name] == null || data[rule[i].name].length < 1){this.error = rule[i].errorMsg; return false;}
				break;
			}
		}
		return true;
	},
	isNumber : function (checkVal){
		checkVal = Number(checkVal);
		if(checkVal == NaN){return false;}
		return true;
	}
}
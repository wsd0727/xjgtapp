
const apiPublic={};

apiPublic.login = "/api/SingleLogin/Login"
apiPublic.updateVersion = "/api/Common/UpdateVersion"
apiPublic.setPassword = "/api/SystemCenter/UpdatePassword" 
apiPublic.config = "/api/SystemCenter/GetAppDynamicData"
apiPublic.upload = '/api/Common/Upload'
apiPublic.baseUrl = "http://139.129.206.158:8111/"
apiPublic.GspLocation = '/api/Common/GspLocation'

apiPublic.getApproval01 = '/api/PhoneApproval/ApprovalFlow' // 审批流验证
apiPublic.getApprovalDate = '/api/PhoneApproval/GetBaflowInfo?BILLNO=' // 获取当前审批节点
// let a = [M001,M002,M003,M004,M101,M102,M103,M104,M301M302,] ;
// 采购无单派车，采购派车，运单，磅单


export default  {
	apiPublic
}
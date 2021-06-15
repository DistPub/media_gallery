export const defaultDoc = {
  "platform": "微博",
  "name": "张三分",
  "id": "545616812",
  "category": "种草",
  "follow_number": 4564654,
  "activate": "45%",
  "accounting_period": "30天",
  "micro_task_direct": "30天",
  "micro_task_forward": "30天",
  "pay_category": "对公",
  "vendor": "文档问号",
  "vendor_account": `苏州铃铛文化传播有限公司\n
银行：中国银行股份有限公司昆山衡山路支行\n
账号：459871549669`
};

export const defaultDocLabel = {
  "platform": "平台",
  "name": "账号名称",
  "id": "ID/链接",
  "category": "类别",
  "follow_number": "粉丝量",
  "activate": "粉丝活跃度",
  "accounting_period": "账期",
  "micro_task_direct": "微任务直发",
  "micro_task_forward": "微任务转发",
  "pay_category": "付款形式",
  "vendor": "供应商名称",
  "vendor_account": "供应商账户"
};


function inverted(target) {
  let tmp = {};

  for (let key in target) {
    tmp[target[key]] = key;
  }

  return tmp;
}

export const defaultDocLabelInverted = inverted(defaultDocLabel);

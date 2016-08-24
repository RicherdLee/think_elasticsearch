# 介绍
以elasticsearch.js为基础，elasticsearch操作工具。  
thinknode,thinkorm,nodejs,elasticsearch
#功能
1.支持根据模型生成索引map(前提索引必须存在)，并会在模型mappingg变化后动态改变索引map，因为es不支持以后map的field类型修改因此当模型mapping中字段类型变化时，采用重建索引迁移数据，并使用es别名功能保证模型名不变的方式进行迁移。因此不建议重复修改mapping字段类型  
2.新增，批量新增，查询，聚合功能。
#示例(见test目录下)
1.colleaction.js  
  elasticsearch的mapping只能添加不能修改,因此当mapping的field变化时,只能重建索引并迁移数据，为了保证模型名称不变,采用elasticsearch的别名方式  
  同时对于未在mapping表示的field,而插入数据时,es会自动进行匹配  
2.add.js写入数据。  
3.addAll.js批量写入数据  
4.select.js查询  
  es的查询分为match和filter查询,match是全文检索,根据相关度匹配,filter是精确查找  
5.sum_avg_min_max.js 求和,平均值,最大值,最小值  
6.simple_aggs.js 聚合功能。  
  普通分组聚合,类似关系数据库group。  
7.match_filter_aggs.js 过滤查询与聚合  
  可分为先过滤再聚合,只过滤聚合数据未实现后置过滤器  
8.date_histogram_aggs.js 按时间序列进行数据分析  
  ES最常用的时间序列分析方法。可对时间分组后进一步聚合  。
#贡献者
richenlin richerdlee
#协议
MIT

import openai
import json
import os
from config import config
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # 获取YUNWU-OPENAI配置
        llm_config = config.get_llm_config('YUNWU-OPENAI')
        
        # 设置OpenAI客户端配置
        self.api_key = llm_config['api_key']
        self.base_url = llm_config['base_url']
        
        # 尝试创建客户端
        try:
            self.client = openai.OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        except Exception as e:
            logger.error(f"初始化OpenAI客户端失败: {str(e)}")
            # 如果失败，尝试不使用base_url的方式
            self.client = None
            
        self.model = "gpt-4.1-2025-04-14"
    
    def get_extraction_schema(self):
        """定义CDE关键信息提取的JSON Schema"""
        return {
            "type": "object",
            "properties": {
                "company_name": {
                    "type": "string",
                    "description": "公司名称"
                },
                "drug_name": {
                    "type": "string", 
                    "description": "试验药物名称/代号"
                },
                "dosage_form": {
                    "type": "string",
                    "description": "剂型/规格"
                },
                "trial_phase": {
                    "type": "string",
                    "description": "试验分期/单药联合"
                },
                "study_design": {
                    "type": "string",
                    "description": "方案设计（分组及样本量、给药周期、剂量、随机及盲法、PK/PD、非劣优效/等效设计等）"
                },
                "primary_endpoint": {
                    "type": "string",
                    "description": "主要指标"
                },
                "inclusion_criteria": {
                    "type": "string",
                    "description": "入选人物画像"
                },
                "exclusion_criteria": {
                    "type": "string",
                    "description": "排除人物画像"
                },
                "total_sample_size": {
                    "type": "string",
                    "description": "总样本量"
                },
                "center_count": {
                    "type": "string",
                    "description": "中心数"
                },
                "first_patient_in": {
                    "type": "string",
                    "description": "首例入组日期"
                },
                "study_completion_date": {
                    "type": "string",
                    "description": "试验完成日期"
                }
            },
            "required": ["company_name", "drug_name", "dosage_form", "trial_phase", 
                        "study_design", "primary_endpoint", "inclusion_criteria", 
                        "exclusion_criteria", "total_sample_size", "center_count",
                        "first_patient_in", "study_completion_date"],
            "additionalProperties": False
        }

    def get_foreign_trial_extraction_schema(self):
        """定义国外试验文献调研关键信息提取的JSON Schema"""
        return {
            "type": "object",
            "properties": {
                "company_publication_country": {
                    "type": "string",
                    "description": "公司名称/发表时间/试验国家"
                },
                "drug_name": {
                    "type": "string", 
                    "description": "试验药物名称/代号"
                },
                "dosage_form": {
                    "type": "string",
                    "description": "剂型/规格"
                },
                "trial_phase": {
                    "type": "string",
                    "description": "试验分期/单药联合"
                },
                "study_design": {
                    "type": "string",
                    "description": "方案设计（分组及样本量、给药周期、剂量、随机及盲法、PK/PD、非劣优效/等效设计等）"
                },
                "primary_secondary_endpoints": {
                    "type": "string",
                    "description": "主要指标/次要指标"
                },
                "inclusion_criteria": {
                    "type": "string",
                    "description": "入选人物画像"
                },
                "exclusion_criteria": {
                    "type": "string",
                    "description": "排除人物画像"
                },
                "confidence_interval_values": {
                    "type": "string",
                    "description": "置信区间/界值/个体内CV值"
                },
                "trial_results_conclusions": {
                    "type": "string",
                    "description": "PK/PD/主次疗评指标试验结果及试验结论"
                },
                "center_count": {
                    "type": "string",
                    "description": "中心数"
                },
                "reference_level": {
                    "type": "string",
                    "description": "参考等级（强、一般、弱）"
                }
            },
            "required": ["company_publication_country", "drug_name", "dosage_form", "trial_phase", 
                        "study_design", "primary_secondary_endpoints", "inclusion_criteria", 
                        "exclusion_criteria", "confidence_interval_values", "trial_results_conclusions",
                        "center_count", "reference_level"],
            "additionalProperties": False
        }
    
    def get_extraction_prompt(self, content):
        """生成CDE关键信息提取的Prompt"""
        return f"""
你是一个专业的医学文献信息提取专家。请从以下医学试验文献中提取关键信息。

文献内容：
{content}

请提取以下关键信息：
1. 公司名称 - 进行试验的公司或机构名称
2. 试验药物名称/代号 - 试验药物的正式名称或代号
3. 剂型/规格 - 药物的剂型和规格信息
4. 试验分期/单药联合 - 临床试验的期数和是否为单药或联合用药
5. 方案设计 - 包括分组、样本量、给药周期、剂量、随机化、盲法、PK/PD、非劣优效/等效设计等
6. 主要指标 - 试验的主要终点指标
7. 入选人物画像 - 试验受试者的入选标准
8. 排除人物画像 - 试验受试者的排除标准
9. 总样本量 - 计划招募的总受试者数量
10. 中心数 - 参与试验的研究中心数量
11. 首例入组日期 - 第一位受试者入组的日期
12. 试验完成日期 - 试验预计或实际完成的日期

请根据文献内容尽可能准确地提取这些信息。如果某个信息在文献中不存在或不明确，请返回"未提及"或"信息不明确"。

请确保返回的JSON格式严格符合要求。
"""

    def get_foreign_trial_extraction_prompt(self, content):
        """生成国外试验文献调研关键信息提取的Prompt"""
        return f"""
你是一个专业的国外医学试验文献信息提取专家。请从以下国外试验文献中提取关键信息。

文献内容：
{content}

请提取以下关键信息：
1. 公司名称/发表时间/试验国家 - 进行试验的公司名称、文献发表时间、试验进行的国家，格式如：Vyne Therapeutics Inc./2016年/美国、多米尼加共和国
2. 试验药物名称/代号 - 试验药物的正式名称或代号
3. 剂型/规格 - 药物的剂型和规格信息，如：4%
4. 试验分期/单药联合 - 临床试验的期数和是否为单药或联合用药，如：III期
5. 方案设计 - 包括分组及样本量、给药周期、剂量、随机及盲法、PK/PD、非劣优效/等效设计等详细信息
6. 主要指标/次要指标 - 试验的主要和次要终点指标
7. 入选人物画像 - 试验受试者的详细入选标准
8. 排除人物画像 - 试验受试者的详细排除标准
9. 置信区间/界值/个体内CV值 - 统计学相关数值
10. PK/PD/主次疗评指标试验结果及试验结论 - 试验的具体结果和结论
11. 中心数 - 参与试验的研究中心数量
12. 参考等级 - 评估该文献的参考价值等级：强、一般、弱

请根据文献内容尽可能准确地提取这些信息。如果某个信息在文献中不存在或不明确，请返回"未提及"或"信息不明确"。

请确保返回的JSON格式严格符合要求。
"""

    def get_summary_prompt(self, content):
        """生成方案摘要提取的Prompt"""
        return f"""
你是一个专业的临床试验方案摘要专家。请从以下医学试验文献中提取关键信息，用于生成方案摘要。

文献内容：
{content}

请提取以下关键信息：
1. 研究题目 - 试验的完整标题
2. 试验药物名称及规格 - 包括药物名称、剂型、规格等完整信息
3. 适应症 - 试验药物适用的疾病或症状
4. 试验分期 - 临床试验的期数（如I期、II期、III期等）
5. 研究中心数 - 参与试验的研究中心数量
6. 研究周期 - 试验的持续时间或计划周期
7. 研究目的 - 包括主要目的和次要目的
8. 疗效指标 - 包括主要终点、次要终点、探索性终点、安全性评价
9. 试验设计 - 包括研究人群选择及导入期设计依据、阳性对照药品选择及依据、主要疗效终点的选择及依据
10. 试验流程 - 试验的具体实施流程和步骤
11. 样本量 - 计划招募的受试者数量及计算依据
12. 试验用药品，规格，用法用量 - 详细的用药信息
13. 合并治疗 - 允许的合并用药或治疗
14. 挽救治疗 - 紧急情况下的挽救措施
15. 入排标准 - 受试者的入选和排除标准
16. 退出和中止/终止标准 - 试验退出、中止或终止的条件
17. 统计分析 - 统计分析方法和计划

请根据文献内容尽可能准确和详细地提取这些信息。如果某个信息在文献中不存在或不明确，请返回"未提及"或"信息不明确"。

请确保返回的JSON格式严格符合要求，特别注意嵌套对象的结构。
"""
    
    def extract_key_info(self, content, literature_type="CDE"):
        """使用LLM提取关键信息"""
        if self.client is None:
            # 重新尝试初始化客户端
            try:
                self.client = openai.OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
            except Exception as e:
                logger.error(f"无法初始化OpenAI客户端: {str(e)}")
                raise Exception("OpenAI客户端初始化失败，请检查API配置和网络连接")
        
        try:
            # 根据文献类型选择不同的prompt和schema
            if literature_type == "国外试验文献调研":
                prompt = self.get_foreign_trial_extraction_prompt(content)
                schema = self.get_foreign_trial_extraction_schema()
                schema_name = "foreign_trial_extraction"
            else:
                prompt = self.get_extraction_prompt(content)
                schema = self.get_extraction_schema()
                schema_name = "medical_trial_extraction"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的医学文献信息提取专家，请严格按照JSON Schema格式返回提取的信息。"},
                    {"role": "user", "content": prompt}
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name,
                        "schema": schema
                    }
                },
                temperature=0.1
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.info(f"成功提取{literature_type}关键信息")
            return result
            
        except Exception as e:
            logger.error(f"LLM提取{literature_type}关键信息失败: {str(e)}")
            raise e

    def generate_summary(self, content):
        """使用LLM生成方案摘要"""
        if self.client is None:
            # 重新尝试初始化客户端
            try:
                self.client = openai.OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
            except Exception as e:
                logger.error(f"无法初始化OpenAI客户端: {str(e)}")
                raise Exception("OpenAI客户端初始化失败，请检查API配置和网络连接")
        
        try:
            prompt = self.get_summary_prompt(content)
            schema = self.get_summary_schema()
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的临床试验方案摘要专家，请严格按照JSON Schema格式返回提取的信息。"},
                    {"role": "user", "content": prompt}
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "summary_extraction",
                        "schema": schema
                    }
                },
                temperature=0.1
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.info("成功生成方案摘要")
            return result
            
        except Exception as e:
            logger.error(f"LLM生成方案摘要失败: {str(e)}")
            raise e

    def read_md_file(self, file_path):
        """读取Markdown文件内容"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content
        except Exception as e:
            logger.error(f"读取文件失败 {file_path}: {str(e)}")
            raise e
    
    def find_md_file_path(self, literature_folder, literature_name):
        """根据文献文件夹名称查找对应的MD文件路径"""
        # 构建MD文件路径: 文献文件夹/auto/文献名.md
        md_file_path = os.path.join(literature_folder, 'auto', f'{literature_name}.md')
        
        if not os.path.exists(md_file_path):
            raise FileNotFoundError(f"MD文件不存在: {md_file_path}")
        
        return md_file_path

    def get_summary_schema(self):
        """定义方案摘要提取的JSON Schema"""
        return {
            "type": "object",
            "properties": {
                "study_title": {
                    "type": "string",
                    "description": "研究题目"
                },
                "drug_name_specification": {
                    "type": "string",
                    "description": "试验药物名称及规格"
                },
                "indication": {
                    "type": "string",
                    "description": "适应症"
                },
                "trial_phase": {
                    "type": "string",
                    "description": "试验分期"
                },
                "center_count": {
                    "type": "string",
                    "description": "研究中心数"
                },
                "study_period": {
                    "type": "string",
                    "description": "研究周期"
                },
                "study_objectives": {
                    "type": "object",
                    "properties": {
                        "primary_objective": {
                            "type": "string",
                            "description": "主要目的"
                        },
                        "secondary_objective": {
                            "type": "string",
                            "description": "次要目的"
                        }
                    },
                    "required": ["primary_objective", "secondary_objective"],
                    "additionalProperties": False
                },
                "efficacy_endpoints": {
                    "type": "object",
                    "properties": {
                        "primary_endpoint": {
                            "type": "string",
                            "description": "主要终点"
                        },
                        "secondary_endpoint": {
                            "type": "string",
                            "description": "次要终点"
                        },
                        "exploratory_endpoint": {
                            "type": "string",
                            "description": "探索性终点"
                        },
                        "safety_evaluation": {
                            "type": "string",
                            "description": "安全性评价"
                        }
                    },
                    "required": ["primary_endpoint", "secondary_endpoint", "exploratory_endpoint", "safety_evaluation"],
                    "additionalProperties": False
                },
                "trial_design": {
                    "type": "object",
                    "properties": {
                        "study_population_selection": {
                            "type": "string",
                            "description": "研究人群选择及导入期设计依据"
                        },
                        "positive_control_selection": {
                            "type": "string",
                            "description": "阳性对照药品选择及依据"
                        },
                        "primary_endpoint_selection": {
                            "type": "string",
                            "description": "主要疗效终点的选择及依据"
                        }
                    },
                    "required": ["study_population_selection", "positive_control_selection", "primary_endpoint_selection"],
                    "additionalProperties": False
                },
                "trial_process": {
                    "type": "string",
                    "description": "试验流程"
                },
                "sample_size": {
                    "type": "string",
                    "description": "样本量"
                },
                "investigational_drug": {
                    "type": "string",
                    "description": "试验用药品，规格，用法用量"
                },
                "concomitant_treatment": {
                    "type": "string",
                    "description": "合并治疗"
                },
                "rescue_treatment": {
                    "type": "string",
                    "description": "挽救治疗"
                },
                "inclusion_exclusion_criteria": {
                    "type": "string",
                    "description": "入排标准"
                },
                "withdrawal_termination_criteria": {
                    "type": "string",
                    "description": "退出和中止/终止标准"
                },
                "statistical_analysis": {
                    "type": "string",
                    "description": "统计分析"
                }
            },
            "required": ["study_title", "drug_name_specification", "indication", "trial_phase", 
                        "center_count", "study_period", "study_objectives", "efficacy_endpoints",
                        "trial_design", "trial_process", "sample_size", "investigational_drug",
                        "concomitant_treatment", "rescue_treatment", "inclusion_exclusion_criteria",
                        "withdrawal_termination_criteria", "statistical_analysis"],
            "additionalProperties": False
        }

# 延迟初始化，避免导入时错误
llm_service = None

def get_llm_service():
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service 
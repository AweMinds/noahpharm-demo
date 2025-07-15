import configparser
import os

class Config:
    def __init__(self):
        self.config = configparser.ConfigParser()
        config_path = os.path.join(os.path.dirname(__file__), '.provider_env')
        self.config.read(config_path, encoding='utf-8')
    
    def get_llm_config(self, provider='YUNWU-OPENAI'):
        """获取LLM配置"""
        if provider not in self.config:
            raise ValueError(f"未找到配置: {provider}")
        
        return {
            'api_key': self.config[provider]['api_key'],
            'base_url': self.config[provider]['base_url']
        }

config = Config() 
// 文件系统服务
// 调用Python后端API来读取真实的文件夹结构

const API_BASE_URL = 'http://localhost:5000/api';

class FileSystemService {
  // 获取所有区域的文件夹数据
  static async getAllFolders() {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('获取所有文件夹数据失败:', error);
      // 如果API调用失败，返回空数据而不是模拟数据
      return {
        'CDE同类品种-临床备案公示平台试验信息': [],
        '国外试验文献调研': [],
        '法规_指导原则_用药指南': [],
        '说明书': []
      };
    }
  }

  // 读取指定路径下的子文件夹
  static async getSubfolders(folderPath) {
    try {
      const encodedPath = encodeURIComponent(folderPath);
      const response = await fetch(`${API_BASE_URL}/folders?path=${encodedPath}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.subfolders || [];
    } catch (error) {
      console.error('读取文件夹失败:', error);
      return [];
    }
  }

  // 检查路径是否存在
  static async pathExists(folderPath) {
    try {
      const encodedPath = encodeURIComponent(folderPath);
      const response = await fetch(`${API_BASE_URL}/check-path?path=${encodedPath}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.exists;
    } catch (error) {
      console.error('检查路径失败:', error);
      return false;
    }
  }

  // 健康检查
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('后端服务健康检查失败:', error);
      return false;
    }
  }

  // 提取关键信息
  static async extractKeyInfo(selectedItems) {
    try {
      const response = await fetch(`${API_BASE_URL}/extract-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_items: selectedItems
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('提取关键信息失败:', error);
      throw error;
    }
  }

  // 生成方案摘要
  static async generateSummary(literatureInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          literature_info: literatureInfo
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('生成方案摘要失败:', error);
      throw error;
    }
  }

  // 下载方案摘要Word文档
  static async downloadSummary(summaryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/download-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summaryData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 检查是否是JSON错误响应
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
      }
      
      // 处理文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = '方案摘要.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('下载方案摘要失败:', error);
      throw error;
    }
  }
}

export default FileSystemService; 
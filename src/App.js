import React, { useState, useEffect } from 'react';
import './App.css';
import FileSystemService from './services/fileSystemService';
import ExtractionResults from './components/ExtractionResults';
import SummaryView from './components/SummaryView';

const App = () => {
  const [folderData, setFolderData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [extracting, setExtracting] = useState(false);
  const [extractionResults, setExtractionResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  // 配置区域信息
  const sections = [
    {
      name: 'CDE同类品种-临床备案公示平台试验信息',
      path: 'E:\\temp\\氨氯地平缬沙坦氢氯噻嗪片-demo\\CDE同类品种-临床备案公示平台试验信息',
      enabled: true
    },
    {
      name: '国外试验文献调研',
      path: 'E:\\temp\\氨氯地平缬沙坦氢氯噻嗪片-demo\\国外试验文献调研',
      enabled: true
    },
    {
      name: '法规_指导原则_用药指南',
      path: 'E:\\temp\\氨氯地平缬沙坦氢氯噻嗪片-demo\\法规_指导原则_用药指南',
      enabled: false
    },
    {
      name: '说明书',
      path: 'E:\\temp\\氨氯地平缬沙坦氢氯噻嗪片-demo\\说明书',
      enabled: false
    }
  ];

  // 读取真实的文件夹数据
  useEffect(() => {
    const loadFolderData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 首先检查后端服务状态
        const isHealthy = await FileSystemService.healthCheck();
        if (!isHealthy) {
          setBackendStatus('error');
          setError('后端服务连接失败，请确保Python服务已启动');
          return;
        }
        
        setBackendStatus('connected');
        
        // 获取所有文件夹数据
        const data = await FileSystemService.getAllFolders();
        setFolderData(data);
        
        // 检查是否有数据
        const totalItems = Object.values(data).reduce((sum, items) => sum + items.length, 0);
        if (totalItems === 0) {
          setError('未找到任何文件夹，请检查路径是否正确');
        }
        
      } catch (err) {
        console.error('加载文件夹数据失败:', err);
        setError(`加载数据失败: ${err.message}`);
        setBackendStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadFolderData();
  }, []);

  // 处理勾选状态
  const handleCheckboxChange = (sectionName, itemName) => {
    const itemKey = `${sectionName}/${itemName}`;
    setSelectedItems(prev => {
      if (prev.includes(itemKey)) {
        return prev.filter(item => item !== itemKey);
      } else {
        return [...prev, itemKey];
      }
    });
  };

  // 处理提取关键信息按钮点击
  const handleExtractInfo = async () => {
    setExtracting(true);
    setError(null);
    
    try {
      // 过滤出支持的类型的选中项
      const supportedItems = selectedItems.filter(item => 
        item.startsWith('CDE同类品种-临床备案公示平台试验信息/') ||
        item.startsWith('国外试验文献调研/')
      );
      
      if (supportedItems.length === 0) {
        setError('请选择至少一个"CDE同类品种-临床备案公示平台试验信息"或"国外试验文献调研"类目下的文献');
        return;
      }
      
      console.log('开始提取关键信息，选中的项目:', supportedItems);
      
      const result = await FileSystemService.extractKeyInfo(supportedItems);
      console.log('提取结果:', result);
      
      setExtractionResults(result.results);
      setShowResults(true);
      
    } catch (err) {
      console.error('提取关键信息失败:', err);
      setError(`提取关键信息失败: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  // 重新加载数据
  const handleReload = () => {
    window.location.reload();
  };

  // 返回主界面
  const handleBackToMain = () => {
    setShowResults(false);
    setExtractionResults(null);
    setShowSummary(false);
    setSummaryData(null);
  };

  // 处理生成方案摘要
  const handleGenerateSummary = async (selectedLiterature) => {
    setGeneratingSummary(true);
    setError(null);
    
    try {
      console.log('开始生成方案摘要，选中的文献:', selectedLiterature);
      
      const result = await FileSystemService.generateSummary(selectedLiterature);
      console.log('生成摘要结果:', result);
      
      setSummaryData(result.summary);
      setShowSummary(true);
      setShowResults(false);
      
    } catch (err) {
      console.error('生成方案摘要失败:', err);
      setError(`生成方案摘要失败: ${err.message}`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // 处理下载Word文档
  const handleDownloadSummary = async (editedSummary) => {
    try {
      console.log('开始下载方案摘要Word文档');
      
      await FileSystemService.downloadSummary(editedSummary);
      
    } catch (err) {
      console.error('下载方案摘要失败:', err);
      setError(`下载方案摘要失败: ${err.message}`);
    }
  };

  // 从方案摘要页面返回到结果页面
  const handleBackToResults = () => {
    setShowSummary(false);
    setShowResults(true);
  };

  // 如果显示方案摘要页面
  if (showSummary && summaryData) {
    return (
      <SummaryView 
        summary={summaryData}
        onBack={handleBackToResults}
        onDownload={handleDownloadSummary}
      />
    );
  }

  // 如果显示结果页面
  if (showResults && extractionResults) {
    return (
      <ExtractionResults 
        results={extractionResults} 
        onBack={handleBackToMain}
        onGenerateSummary={handleGenerateSummary}
        generatingSummary={generatingSummary}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>医学方案摘要协作平台</h1>
        <div className="status-indicator">
          <span className={`status-dot ${backendStatus}`}></span>
          <span className="status-text">
            {backendStatus === 'checking' && '检查服务状态...'}
            {backendStatus === 'connected' && '服务已连接'}
            {backendStatus === 'error' && '服务连接失败'}
          </span>
        </div>
      </header>
      
      <main className="app-main">
        {(loading || generatingSummary) && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{loading ? '正在加载文件夹数据...' : '正在生成方案摘要，请稍候...'}</p>
          </div>
        )}
        
        {extracting && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在提取关键信息，请稍候...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <div className="error-message">
              <h3>⚠️ {extracting ? '提取失败' : generatingSummary ? '生成摘要失败' : '加载失败'}</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={handleReload} className="retry-button">
                  重新加载
                </button>
                {backendStatus === 'error' && (
                  <div className="error-help">
                    <p>请确保:</p>
                    <ul>
                      <li>Python后端服务已启动 (运行 python backend/app.py)</li>
                      <li>服务运行在 http://localhost:5000</li>
                      <li>指定的文件夹路径存在</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!loading && !error && !extracting && !generatingSummary && (
          <>
            <div className="sections-container">
              {sections.map((section) => (
                <div key={section.name} className="section">
                  <h2 className="section-title">{section.name}</h2>
                  <div className="section-content">
                    {folderData[section.name]?.length > 0 ? (
                      folderData[section.name].map((item) => (
                        <div key={item} className="folder-item">
                          <label className={`folder-label ${!section.enabled ? 'disabled' : ''}`}>
                            <input
                              type="checkbox"
                              disabled={!section.enabled}
                              checked={selectedItems.includes(`${section.name}/${item}`)}
                              onChange={() => handleCheckboxChange(section.name, item)}
                            />
                            <span className="folder-name">{item}</span>
                          </label>
                          {!section.enabled && (
                            <span className="demo-note">demo不支持处理此类材料</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-folder">
                        <span>📁 该路径下暂无子文件夹</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="action-container">
              <button
                className={`extract-button ${selectedItems.length > 0 ? 'active' : ''}`}
                disabled={selectedItems.length === 0}
                onClick={handleExtractInfo}
              >
                提取关键信息
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App; 
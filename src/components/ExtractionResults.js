import React, { useState } from 'react';
import './ExtractionResults.css';

const ExtractionResults = ({ results, onBack, onGenerateSummary, generatingSummary = false }) => {
  const [selectedLiterature, setSelectedLiterature] = useState(null);

  // CDE字段映射表
  const cdeFieldMapping = {
    'company_name': '公司名称',
    'drug_name': '试验药物名称/代号',
    'dosage_form': '剂型/规格',
    'trial_phase': '试验分期/单药联合',
    'study_design': '方案设计',
    'primary_endpoint': '主要指标',
    'total_sample_size': '总样本量',
    'center_count': '中心数',
    'first_patient_in': '首例入组日期',
    'study_completion_date': '试验完成日期'
  };

  // 国外试验文献调研字段映射表
  const foreignTrialFieldMapping = {
    'company_publication_country': '公司名称/发表时间/试验国家',
    'drug_name': '试验药物名称/代号',
    'dosage_form': '剂型/规格',
    'trial_phase': '试验分期/单药联合',
    'study_design': '方案设计',
    'primary_secondary_endpoints': '主要指标/次要指标',
    'confidence_interval_values': '置信区间/界值/个体内CV值',
    'trial_results_conclusions': 'PK/PD/主次疗评指标试验结果及试验结论',
    'center_count': '中心数',
    'reference_level': '参考等级（强、一般、弱）'
  };

  // 格式化入排人物画像
  const formatInclusionExclusion = (result) => {
    const inclusion = result.inclusion_criteria || '未提及';
    const exclusion = result.exclusion_criteria || '未提及';
    
    return (
      <div>
        <div><strong>入选：</strong>{inclusion}</div>
        <div><strong>排除：</strong>{exclusion}</div>
      </div>
    );
  };

  // 处理单选框选择
  const handleLiteratureSelect = (result) => {
    setSelectedLiterature(result);
  };

  // 按section_name分组结果
  const groupedResults = results.reduce((acc, result) => {
    if (result.error) {
      if (!acc.errors) acc.errors = [];
      acc.errors.push(result);
    } else {
      const sectionName = result.section_name || 'unknown';
      if (!acc[sectionName]) acc[sectionName] = [];
      acc[sectionName].push(result);
    }
    return acc;
  }, {});

  // 渲染CDE表格
  const renderCDETable = (data) => {
    return (
      <div className="section-results">
        <h3>CDE同类品种-临床备案公示平台试验信息</h3>
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>关键文献</th>
                <th>文献名称</th>
                {Object.values(cdeFieldMapping).map(fieldName => (
                  <th key={fieldName}>{fieldName}</th>
                ))}
                <th>入排人物画像</th>
              </tr>
            </thead>
            <tbody>
              {data.map((result, index) => (
                <tr key={index}>
                  <td className="literature-select">
                    <input
                      type="radio"
                      name="selectedLiterature"
                      value={index}
                      checked={selectedLiterature && selectedLiterature.literature_name === result.literature_name && selectedLiterature.section_name === result.section_name}
                      onChange={() => handleLiteratureSelect(result)}
                    />
                  </td>
                  <td className="literature-name">{result.literature_name}</td>
                  {Object.keys(cdeFieldMapping).map(fieldKey => (
                    <td key={fieldKey} className="field-content">
                      {result[fieldKey] || '未提及'}
                    </td>
                  ))}
                  <td className="inclusion-exclusion">
                    {formatInclusionExclusion(result)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 渲染国外试验文献调研表格
  const renderForeignTrialTable = (data) => {
    return (
      <div className="section-results">
        <h3>国外试验文献调研</h3>
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>关键文献</th>
                <th>文献名称</th>
                {Object.values(foreignTrialFieldMapping).map(fieldName => (
                  <th key={fieldName}>{fieldName}</th>
                ))}
                <th>入排人物画像</th>
              </tr>
            </thead>
            <tbody>
              {data.map((result, index) => (
                <tr key={index}>
                  <td className="literature-select">
                    <input
                      type="radio"
                      name="selectedLiterature"
                      value={index}
                      checked={selectedLiterature && selectedLiterature.literature_name === result.literature_name && selectedLiterature.section_name === result.section_name}
                      onChange={() => handleLiteratureSelect(result)}
                    />
                  </td>
                  <td className="literature-name">{result.literature_name}</td>
                  {Object.keys(foreignTrialFieldMapping).map(fieldKey => (
                    <td key={fieldKey} className="field-content">
                      {result[fieldKey] || '未提及'}
                    </td>
                  ))}
                  <td className="inclusion-exclusion">
                    {formatInclusionExclusion(result)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 获取有效结果总数
  const validResultsCount = Object.keys(groupedResults).reduce((count, key) => {
    if (key !== 'errors') {
      count += groupedResults[key].length;
    }
    return count;
  }, 0);

  // 处理生成方案摘要
  const handleGenerateSummary = () => {
    if (selectedLiterature && onGenerateSummary) {
      onGenerateSummary(selectedLiterature);
    }
  };

  return (
    <div className="extraction-results">
      <div className="results-header">
        <h2>关键信息提取结果</h2>
        <button onClick={onBack} className="back-button">
          返回
        </button>
      </div>

      {/* 生成摘要时的等待动画 */}
      {generatingSummary && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在生成方案摘要，请稍候...</p>
        </div>
      )}

      {!generatingSummary && (
        <>
          {groupedResults.errors && groupedResults.errors.length > 0 && (
            <div className="error-section">
              <h3>处理失败的文献</h3>
              {groupedResults.errors.map((result, index) => (
                <div key={index} className="error-item">
                  <strong>{result.literature_name}:</strong> {result.error}
                </div>
              ))}
            </div>
          )}

          {/* 渲染CDE表格 */}
          {groupedResults['CDE同类品种-临床备案公示平台试验信息'] && 
           groupedResults['CDE同类品种-临床备案公示平台试验信息'].length > 0 && 
           renderCDETable(groupedResults['CDE同类品种-临床备案公示平台试验信息'])}

          {/* 渲染国外试验文献调研表格 */}
          {groupedResults['国外试验文献调研'] && 
           groupedResults['国外试验文献调研'].length > 0 && 
           renderForeignTrialTable(groupedResults['国外试验文献调研'])}

          {validResultsCount === 0 && (
            <div className="no-results">
              <p>没有成功提取到关键信息</p>
            </div>
          )}

          <div className="results-summary">
            <p>
              共处理 {results.length} 个文献，
              成功 {validResultsCount} 个，
              失败 {groupedResults.errors ? groupedResults.errors.length : 0} 个
            </p>
          </div>

          {/* 生成方案摘要按钮 */}
          <div className="summary-actions">
            <button 
              onClick={handleGenerateSummary}
              className={`generate-summary-button ${selectedLiterature ? 'enabled' : 'disabled'}`}
              disabled={!selectedLiterature || generatingSummary}
            >
              {generatingSummary ? '正在生成...' : '形成方案摘要'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExtractionResults; 
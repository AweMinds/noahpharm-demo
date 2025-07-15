import React, { useState } from 'react';
import './SummaryView.css';

const SummaryView = ({ summary, onBack, onDownload }) => {
  const [editableSummary, setEditableSummary] = useState({
    study_title: summary.study_title || '',
    sponsor: '', // 新增字段
    protocol_number: '', // 新增字段
    principal_investigator: '', // 新增字段
    drug_name_specification: summary.drug_name_specification || '',
    indication: summary.indication || '',
    trial_phase: summary.trial_phase || '',
    center_count: summary.center_count || '',
    study_period: summary.study_period || '',
    study_objectives: {
      primary_objective: summary.study_objectives?.primary_objective || '',
      secondary_objective: summary.study_objectives?.secondary_objective || ''
    },
    efficacy_endpoints: {
      primary_endpoint: summary.efficacy_endpoints?.primary_endpoint || '',
      secondary_endpoint: summary.efficacy_endpoints?.secondary_endpoint || '',
      exploratory_endpoint: summary.efficacy_endpoints?.exploratory_endpoint || '',
      safety_evaluation: summary.efficacy_endpoints?.safety_evaluation || ''
    },
    trial_design: {
      study_population_selection: summary.trial_design?.study_population_selection || '',
      positive_control_selection: summary.trial_design?.positive_control_selection || '',
      primary_endpoint_selection: summary.trial_design?.primary_endpoint_selection || ''
    },
    trial_process: summary.trial_process || '',
    sample_size: summary.sample_size || '',
    investigational_drug: summary.investigational_drug || '',
    concomitant_treatment: summary.concomitant_treatment || '',
    rescue_treatment: summary.rescue_treatment || '',
    inclusion_exclusion_criteria: summary.inclusion_exclusion_criteria || '',
    withdrawal_termination_criteria: summary.withdrawal_termination_criteria || '',
    statistical_analysis: summary.statistical_analysis || ''
  });

  const handleFieldChange = (fieldPath, value) => {
    setEditableSummary(prev => {
      const newSummary = { ...prev };
      const keys = fieldPath.split('.');
      
      if (keys.length === 1) {
        newSummary[keys[0]] = value;
      } else if (keys.length === 2) {
        newSummary[keys[0]] = {
          ...newSummary[keys[0]],
          [keys[1]]: value
        };
      }
      
      return newSummary;
    });
  };

  const handleDownload = () => {
    onDownload(editableSummary);
  };

  const renderEditableField = (label, fieldPath, value, isTextarea = false) => {
    const InputComponent = isTextarea ? 'textarea' : 'input';
    
    return (
      <tr>
        <td className="field-label">{label}</td>
        <td className="field-value">
          <InputComponent
            type={isTextarea ? undefined : "text"}
            value={value}
            onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
            className="editable-field"
            rows={isTextarea ? 4 : undefined}
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="summary-view">
      <div className="summary-header">
        <h2>关键文献方案摘要</h2>
        <button onClick={onBack} className="back-button">
          返回
        </button>
      </div>

      <div className="summary-content">
        <table className="summary-table">
          <tbody>
            {renderEditableField('研究题目', 'study_title', editableSummary.study_title, true)}
            {renderEditableField('申办者', 'sponsor', editableSummary.sponsor)}
            {renderEditableField('方案编号', 'protocol_number', editableSummary.protocol_number)}
            {renderEditableField('组长单位/主要研究者', 'principal_investigator', editableSummary.principal_investigator)}
            {renderEditableField('试验药物名称及规格', 'drug_name_specification', editableSummary.drug_name_specification, true)}
            {renderEditableField('适应症', 'indication', editableSummary.indication, true)}
            {renderEditableField('试验分期', 'trial_phase', editableSummary.trial_phase)}
            {renderEditableField('研究中心数', 'center_count', editableSummary.center_count)}
            {renderEditableField('研究周期', 'study_period', editableSummary.study_period)}
            
            <tr className="section-header">
              <td colSpan="2"><h3>研究目的</h3></td>
            </tr>
            {renderEditableField('主要目的', 'study_objectives.primary_objective', editableSummary.study_objectives.primary_objective, true)}
            {renderEditableField('次要目的', 'study_objectives.secondary_objective', editableSummary.study_objectives.secondary_objective, true)}
            
            <tr className="section-header">
              <td colSpan="2"><h3>疗效指标</h3></td>
            </tr>
            {renderEditableField('主要终点', 'efficacy_endpoints.primary_endpoint', editableSummary.efficacy_endpoints.primary_endpoint, true)}
            {renderEditableField('次要终点', 'efficacy_endpoints.secondary_endpoint', editableSummary.efficacy_endpoints.secondary_endpoint, true)}
            {renderEditableField('探索性终点', 'efficacy_endpoints.exploratory_endpoint', editableSummary.efficacy_endpoints.exploratory_endpoint, true)}
            {renderEditableField('安全性评价', 'efficacy_endpoints.safety_evaluation', editableSummary.efficacy_endpoints.safety_evaluation, true)}
            
            <tr className="section-header">
              <td colSpan="2"><h3>试验设计</h3></td>
            </tr>
            {renderEditableField('研究人群选择及导入期设计依据', 'trial_design.study_population_selection', editableSummary.trial_design.study_population_selection, true)}
            {renderEditableField('阳性对照药品选择及依据', 'trial_design.positive_control_selection', editableSummary.trial_design.positive_control_selection, true)}
            {renderEditableField('主要疗效终点的选择及依据', 'trial_design.primary_endpoint_selection', editableSummary.trial_design.primary_endpoint_selection, true)}
            
            {renderEditableField('试验流程', 'trial_process', editableSummary.trial_process, true)}
            {renderEditableField('样本量', 'sample_size', editableSummary.sample_size, true)}
            {renderEditableField('试验用药品，规格，用法用量', 'investigational_drug', editableSummary.investigational_drug, true)}
            {renderEditableField('合并治疗', 'concomitant_treatment', editableSummary.concomitant_treatment, true)}
            {renderEditableField('挽救治疗', 'rescue_treatment', editableSummary.rescue_treatment, true)}
            {renderEditableField('入排标准', 'inclusion_exclusion_criteria', editableSummary.inclusion_exclusion_criteria, true)}
            {renderEditableField('退出和中止/终止标准', 'withdrawal_termination_criteria', editableSummary.withdrawal_termination_criteria, true)}
            {renderEditableField('统计分析', 'statistical_analysis', editableSummary.statistical_analysis, true)}
          </tbody>
        </table>
      </div>

      <div className="summary-footer">
        <button onClick={handleDownload} className="download-button">
          下载方案摘要
        </button>
      </div>
    </div>
  );
};

export default SummaryView; 
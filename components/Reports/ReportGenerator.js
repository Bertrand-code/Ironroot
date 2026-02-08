import React from 'react';
import { Button } from '@/components/ui/button';

export default function ReportGenerator({ title = 'Executive Report', description = 'Generate a board-ready summary with quantified risk reduction and remediation status.' }) {
  const handleGenerate = () => {
    alert('Report queued. A downloadable PDF will appear in the Report Center.');
  };

  return (
    <div className="card card--glass">
      <h3 className="card__title">{title}</h3>
      <p className="card__meta">{description}</p>
      <div style={{ marginTop: '16px' }}>
        <Button onClick={handleGenerate} variant="secondary">Generate Report</Button>
      </div>
    </div>
  );
}

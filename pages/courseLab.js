import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CourseLab() {
  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="title-lg">Training Labs Unavailable</h1>
          <p className="text-lead">
            Hands-on labs are paused while we expand Ironroot’s core security workflows.
          </p>
        </div>

        <Card className="card card--glass">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="card__meta">
              Explore Code Scanner for automated findings, Threat Intel for live advisories, and AI Pentest for attack
              path simulation.
            </p>
            <Button style={{ marginTop: '16px' }} onClick={() => (window.location.href = '/platform')}>
              Go to Platform
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Careers() {
  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="title-lg">Careers at Ironroot</h1>
          <p className="text-lead">
            We build mission-critical security systems that protect real companies, every day.
          </p>
        </div>

        <div className="grid grid-2">
          <Card className="card card--glass">
            <CardHeader>
              <CardTitle>We&apos;re Not Hiring Right Now</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="card__meta">
                There are currently no open roles. We move fast, so check back soon or join our talent network
                to get the next opportunity.
              </p>
              <Button style={{ marginTop: '16px' }} variant="secondary">
                Join Talent Network
              </Button>
            </CardContent>
          </Card>

          <Card className="card card--glass">
            <CardHeader>
              <CardTitle>What We Look For</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid" style={{ gap: '8px' }}>
                <li className="card__meta">• Security engineers who think like attackers and defenders.</li>
                <li className="card__meta">• Builders who care about performance, reliability, and trust.</li>
                <li className="card__meta">• People who obsess over user experience and impact.</li>
              </ul>
              <p className="card__meta" style={{ marginTop: '12px' }}>
                When roles open, we&apos;ll post them here and notify everyone in the network.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

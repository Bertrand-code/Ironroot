import React from 'react';

const buildStamps = (label) => {
  const stamps = [];
  for (let i = 0; i < 18; i += 1) {
    stamps.push(`${label} • ${i % 2 === 0 ? 'IR' : 'SEC'}`);
  }
  return stamps;
};

export default function SecurityOverlay({ enabled, label }) {
  if (!enabled) return null;
  const stamps = buildStamps(label);
  return (
    <div className="security-watermark" aria-hidden="true">
      {stamps.map((stamp, idx) => (
        <span key={`${stamp}-${idx}`} className="security-watermark__stamp">
          {stamp}
        </span>
      ))}
    </div>
  );
}

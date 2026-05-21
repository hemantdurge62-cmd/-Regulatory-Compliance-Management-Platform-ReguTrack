import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'stat':
        return (
          <div className="card skeleton-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="skeleton-box" style={{ width: 48, height: 48, borderRadius: 12 }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton-box" style={{ width: '40%', height: 24, marginBottom: 8, borderRadius: 4 }}></div>
              <div className="skeleton-box" style={{ width: '60%', height: 16, borderRadius: 4 }}></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="card skeleton-card">
            <div className="skeleton-box" style={{ width: '30%', height: 24, marginBottom: 20, borderRadius: 4 }}></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-box" style={{ width: '100%', height: 40, marginBottom: 12, borderRadius: 4 }}></div>
            ))}
          </div>
        );
      case 'chart':
        return (
          <div className="card skeleton-card">
            <div className="skeleton-box" style={{ width: '40%', height: 24, marginBottom: 20, borderRadius: 4 }}></div>
            <div className="skeleton-box" style={{ width: '100%', height: 200, borderRadius: 8 }}></div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className="card skeleton-card">
            <div className="skeleton-box" style={{ width: '70%', height: 24, marginBottom: 12, borderRadius: 4 }}></div>
            <div className="skeleton-box" style={{ width: '100%', height: 16, marginBottom: 8, borderRadius: 4 }}></div>
            <div className="skeleton-box" style={{ width: '80%', height: 16, borderRadius: 4 }}></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
}

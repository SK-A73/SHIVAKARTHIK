import React from 'react';
import logoImg from '../assets/images/logo.png';

const Logo = ({ size = 52, showText = true }) => {
  return (
    <div className="brand-logo-wrap" style={{ cursor: 'pointer' }}>
      <img
        src={logoImg}
        alt="SHIVA KARTHIK GANESHA COLLECTIONS Logo"
        className="brand-logo-img"
        style={{ width: `${size}px`, height: `${size}px` }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/logo.png';
        }}
      />
      {showText && (
        <div className="brand-title-wrap">
          <span className="brand-title-main">SHIVA KARTHIK GANESHA COLLECTIONS</span>
          <span className="brand-title-sub">Handcrafted Ganesha Idols</span>
        </div>
      )}
    </div>
  );
};

export default Logo;

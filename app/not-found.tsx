'use client';

import React from 'react';
import Link from 'next/link';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1e2330 0%, #0d1117 100%)',
      color: '#e6edf3',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        position: 'relative',
        marginBottom: '2rem'
      }}>
        <div style={{
          fontSize: '12rem',
          fontWeight: 900,
          opacity: 0.05,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          userSelect: 'none'
        }}>
          404
        </div>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <AlertCircle size={40} color="#ef4444" />
        </div>
      </div>

      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
        textAlign: 'center',
        background: 'linear-gradient(to right, #fff, #94a3b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Ồ! Có vẻ bạn đã đi lạc
      </h1>
      
      <p style={{
        color: '#8b949e',
        fontSize: '1.1rem',
        marginBottom: '2.5rem',
        maxWidth: '450px',
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có đủ quyền hạn để truy cập vào phân vùng này.
      </p>

      <div style={{
        display: 'flex',
        gap: '1rem'
      }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: '#9461f7',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 500,
            boxShadow: '0 4px 15px rgba(148, 97, 247, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Home size={18} />
            Trang chủ
          </button>
        </Link>
      </div>

      <div style={{
        marginTop: '5rem',
        fontSize: '0.85rem',
        color: '#484f58'
      }}>
        © 2026 CodeLearn AI. All rights reserved.
      </div>
    </div>
  );
}

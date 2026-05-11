'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface FillInTheBlankEditorProps {
    content: string;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
    language?: string;
}

export const FillInTheBlankEditor: React.FC<FillInTheBlankEditorProps> = ({ 
    content, 
    values, 
    onChange,
    language 
}) => {
    // Parse content to find all {{...}}
    // We split by the regex but keep the matches to identify positions
    const parts = useMemo(() => {
        return content.split(/(\{\{.*?\}\})/g);
    }, [content]);

    const handleInputChange = (index: number, val: string) => {
        onChange({
            ...values,
            [index]: val
        });
    };

    return (
        <div style={{ 
            fontSize: 14, 
            lineHeight: 1.6, 
            background: 'rgba(13, 17, 23, 0.4)', 
            padding: 24, 
            borderRadius: 12,
            border: '1px solid var(--border)',
            whiteSpace: 'pre-wrap',
            color: '#e6edf3',
            overflowY: 'auto',
            maxHeight: '100%'
        }}>
            {parts.map((part, i) => {
                const isMatch = part.startsWith('{{') && part.endsWith('}}');
                if (isMatch) {
                    const placeholder = part.slice(2, -2).trim() || '...';
                    return (
                        <input
                            key={i}
                            value={values[i] || ''}
                            onChange={(e) => handleInputChange(i, e.target.value)}
                            placeholder={placeholder}
                            style={{
                                background: 'rgba(34, 211, 238, 0.1)',
                                border: '1px solid rgba(34, 211, 238, 0.3)',
                                borderRadius: 4,
                                color: 'var(--accent-cyan)',
                                padding: '0 8px',
                                minWidth: Math.max(placeholder.length * 10, 60),
                                width: 'auto',
                                display: 'inline-block',
                                outline: 'none',
                                fontWeight: 700,
                                margin: '0 4px',
                                height: 24,
                                verticalAlign: 'middle'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(34, 211, 238, 0.3)'}
                        />
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};

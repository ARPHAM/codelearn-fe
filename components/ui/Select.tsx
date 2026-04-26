'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface CustomSelectProps {
    label?: string;
    options: SelectOption[];
    value: string | number;
    onChange: (value: any) => void;
    placeholder?: string;
    icon?: LucideIcon;
    minWidth?: number | string;
    style?: React.CSSProperties;
    padding?: string;
    height?: number | string;
}

export default function CustomSelect({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon, 
    minWidth = 160,
    style: customStyle,
    padding,
    height = 44
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value) || options[0] || { label: placeholder || 'Chọn...', value: '' };

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', minWidth, ...customStyle }}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    height: height,
                    background: 'rgba(13, 17, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: padding || (Icon ? '0 36px 0 40px' : '0 36px 0 16px'),
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: '#e6edf3',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
                {Icon && <Icon size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />}
                <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center', overflow: 'hidden' }}>
                    {label && <span style={{ color: '#64748b', flexShrink: 0 }}>{label}:</span>}
                    <span style={{
                        color: '#e6edf3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {selectedOption.label}
                    </span>
                </div>
                <ChevronDown size={14} style={{
                    position: 'absolute',
                    right: 12,
                    color: '#64748b',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    paddingTop: '8px',
                    zIndex: 100,
                    animation: 'fadeInUp 0.1s ease'
                }}>
                    <div style={{
                        background: '#161b22',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: '6px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }} className="custom-scrollbar">
                        {options.map((opt: any) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    color: value === opt.value ? '#a78bfa' : '#94a3b8',
                                    background: value === opt.value ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    fontSize: 13,
                                    fontWeight: value === opt.value ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    if (value !== opt.value) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.color = '#e6edf3';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (value !== opt.value) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

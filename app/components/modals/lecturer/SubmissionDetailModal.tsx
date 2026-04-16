'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { ClipboardList, CheckCircle2, Download, Play, Code2, Beaker, Terminal, XCircle } from 'lucide-react';

const testCasesData = [
  { id: 1, input: 'n=5, edges=[(0,1),(1,2)]', expected: '[0,1,2]', got: '[0,1,2]', time: '12ms', mem: '2.1MB', status: 'pass' },
  { id: 2, input: 'n=3, edges=[(0,2),(2,1)]', expected: '[0,2,1]', got: '[0,2,1]', time: '8ms', mem: '2.0MB', status: 'pass' },
  { id: 3, input: 'n=6 (disconnected)', expected: '[0,1,3]', got: '[0,1]', time: '15ms', mem: '2.3MB', status: 'fail' },
  { id: 4, input: 'n=100, complete graph', expected: 'BFS order', got: 'BFS order', time: '45ms', mem: '3.4MB', status: 'pass' },
  { id: 5, input: 'Empty graph n=0', expected: '[]', got: '[]', time: '2ms', mem: '1.8MB', status: 'pass' },
];

const sourceCode = `#include <bits/stdc++.h>
using namespace std;

vector<int> bfs(int n, vector<vector<int>>& adj) {
    vector<bool> visited(n, false);
    vector<int> order;
    queue<int> q;
    
    q.push(0);
    visited[0] = true;
    
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
    return order;
}

int main() {
    // Test case
    int n = 5;
    vector<vector<int>> adj(n);
    // ... build adjacency list
    auto result = bfs(n, adj);
    for (int v : result) cout << v << " ";
    return 0;
}`;

const stderrContent = `Compilation: OK (g++ -O2 -std=c++17)
Running test 1... PASS (12ms, 2.1MB)
Running test 2... PASS (8ms, 2.0MB)
Running test 3... FAIL
  Expected: [0, 1, 3]
  Got:      [0, 1]
  Error: disconnected components not handled
Running test 4... PASS (45ms, 3.4MB)
Running test 5... PASS (2ms, 1.8MB)
---
Result: 4/5 passed (80%) | Score: 16/20`;

interface SubmissionDetailModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubmissionDetailModal({ open, onClose }: SubmissionDetailModalProps) {
  const [tab, setTab] = useState<'code' | 'testcases' | 'stderr'>('code');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={20} /> Chi tiết Submission</div>}
      subtitle="Nguyễn Minh Khoa · BFS Graph Traversal · C++ · 2 phút trước"
      size="lg"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> 4/5 Passed</span>
            <span className="badge badge-purple">Score: 80/100</span>
            <span className="badge" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>0.18s · 3.4MB</span>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> Download code</button>
          <button className="btn btn-primary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Play size={14} /> Chạy lại</button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="modal-tabs">
        {[
          { id: 'code', label: 'Source Code', icon: <Code2 size={16} /> },
          { id: 'testcases', label: 'Test Cases (4/5)', icon: <Beaker size={16} /> },
          { id: 'stderr', label: 'Terminal Output', icon: <Terminal size={16} /> },
        ].map(t => (
          <div key={t.id} className={`modal-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id as typeof tab)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.icon} {t.label}
          </div>
        ))}
      </div>

      {tab === 'code' && (
        <div className="code-block" style={{ fontSize: 12.5, lineHeight: 2 }}>
          {sourceCode.split('\n').map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              <span className="code-line-number" style={{ minWidth: 36 }}>{i + 1}</span>
              <span style={{ color: line.startsWith('#') ? '#79c0ff' : line.includes('vector') || line.includes('queue') || line.includes('bool') ? '#ff7b72' : line.trim().startsWith('//') ? '#6e7681' : 'var(--text-primary)' }}>
                {line}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'testcases' && (
        <table className="table">
          <thead>
            <tr><th>#</th><th>Input</th><th>Expected</th><th>Got</th><th>Time</th><th>Memory</th><th>Status</th></tr>
          </thead>
          <tbody>
            {testCasesData.map(tc => (
              <tr key={tc.id}>
                <td style={{ fontWeight: 700 }}>#{tc.id}</td>
                <td><code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{tc.input}</code></td>
                <td><code style={{ fontFamily: 'monospace', fontSize: 11, color: '#a5d6ff' }}>{tc.expected}</code></td>
                <td><code style={{ fontFamily: 'monospace', fontSize: 11, color: tc.status === 'fail' ? '#f87171' : '#86efac' }}>{tc.got}</code></td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{tc.time}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{tc.mem}</td>
                <td>
                  <span className={`badge ${tc.status === 'pass' ? 'badge-green' : 'badge-red'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tc.status === 'pass' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {tc.status === 'pass' ? 'Pass' : 'Fail'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'stderr' && (
        <div className="code-block" style={{ fontSize: 12, lineHeight: 1.8 }}>
          {stderrContent.split('\n').map((line, i) => (
            <div key={i} style={{ color: line.includes('FAIL') || line.includes('Error') ? '#f87171' : line.includes('PASS') || line.includes('OK') ? '#86efac' : line.startsWith('---') ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

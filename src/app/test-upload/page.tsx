'use client';

import React, { useState } from 'react';
import { JobService } from '@/services/jobService';

export default function TestUpload() {
  const [jobId, setJobId] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !files) {
      setResult('Please provide both job ID and files');
      return;
    }

    setLoading(true);
    try {
      const fileArray = Array.from(files);
      const uploadResult = await JobService.uploadFiles(jobId, fileArray);
      setResult(JSON.stringify(uploadResult, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Test</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Job ID:</label>
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter job ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">PDF Files:</label>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Uploading...' : 'Upload Files'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
} 
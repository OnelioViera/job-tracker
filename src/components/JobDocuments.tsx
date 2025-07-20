import React from 'react';
import { JobService } from '../services/jobService';
import { IJob } from '../models/Job';

interface JobDocumentsProps {
  job: IJob;
}

export const JobDocuments: React.FC<JobDocumentsProps> = ({ job }) => {
  if (!job.documents || job.documents.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No documents uploaded
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {job.documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
            <div className="flex-1 truncate">
              <div className="font-medium">{doc.originalName}</div>
              <div className="text-gray-500">
                {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
              </div>
            </div>
            <a
              href={JobService.getFileDownloadUrl(job._id!, doc.filename)}
              download={doc.originalName}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors ml-2"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}; 
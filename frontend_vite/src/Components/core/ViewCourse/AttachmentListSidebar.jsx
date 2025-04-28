import React, { useState, useRef } from 'react';
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaFileArchive, FaFileImage, FaFileCode, FaFileExcel, FaFile } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

const getFileIcon = (ext) => {
  switch (ext) {
    case 'pdf': return <FaFilePdf className="text-red-600" />;
    case 'doc':
    case 'docx': return <FaFileWord className="text-blue-600" />;
    case 'ppt':
    case 'pptx': return <FaFilePowerpoint className="text-orange-600" />;
    case 'xls':
    case 'xlsx': return <FaFileExcel className="text-green-600" />;
    case 'zip':
    case 'rar':
    case '7z': return <FaFileArchive className="text-yellow-600" />;
    case 'txt': return <FaFileAlt className="text-gray-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return <FaFileImage className="text-purple-600" />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs':
    case 'rb':
    case 'php': return <FaFileCode className="text-indigo-600" />;
    default: return <FaFile className="text-richblack-300" />;
  }
};

const getFileExt = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const AttachmentListSidebar = ({ attachments = [] }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewExt, setPreviewExt] = useState(null);

  const handleView = (url) => {
    const filename = url.split('/').pop();
    const decodedFilename = decodeURIComponent(filename);
    const ext = getFileExt(decodedFilename);
    setPreviewUrl(url);
    setPreviewExt(ext);
  };

  const closeModal = () => {
    setPreviewUrl(null);
    setPreviewExt(null);
  };

  if (!attachments.length) return null;

  return (
    <div className="mt-2 mb-2 px-2">
      <div className="font-semibold text-xs text-richblack-200 mb-1">Attachments</div>
      <ul className="list-none p-0 space-y-1">
        {attachments.map((url, idx) => {
          const filename = url.split('/').pop();
          const decodedFilename = decodeURIComponent(filename);
          const ext = getFileExt(decodedFilename);
          return (
            <li key={idx} className="flex items-center gap-2 bg-richblack-700 rounded px-2 py-1">
              <span className="text-base">{getFileIcon(ext)}</span>
              <span className="truncate max-w-[110px] text-xs text-richblack-50" title={decodedFilename}>{decodedFilename.length > 18 ? decodedFilename.slice(0, 15) + '...' : decodedFilename}</span>
              {ext && <span className="ml-1 px-1 py-0.5 bg-richblack-800 text-[10px] rounded text-richblack-200 uppercase">{ext}</span>}
              <button
                className="ml-1 text-blue-400 underline text-xs"
                onClick={() => handleView(url)}
              >
                View
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 underline text-xs"
              >
                Download
              </a>
            </li>
          );
        })}
      </ul>
      {/* Modal for preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-richblack-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col relative">
            <button
              className="absolute top-2 right-2 text-2xl text-richblack-200 hover:text-pink-400"
              onClick={closeModal}
            >
              <AiOutlineClose />
            </button>
            <div className="p-4 flex-1 flex flex-col items-center justify-center overflow-auto">
              {previewExt === 'pdf' ? (
                <iframe src={previewUrl} title="PDF Preview" className="w-full h-[85vh] rounded" />
              ) : ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(previewExt) ? (
                <img src={previewUrl} alt="Preview" className="max-h-[85vh] rounded" />
              ) : ['txt', 'md'].includes(previewExt) ? (
                <iframe src={previewUrl} title="Text Preview" className="w-full h-[85vh] rounded bg-richblack-800 text-richblack-50" />
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${previewUrl}&embedded=true`}
                  title="Document Preview"
                  className="w-full h-[85vh] rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentListSidebar; 
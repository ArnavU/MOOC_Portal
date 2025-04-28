import React, { useRef, useState } from 'react';
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaFileArchive, FaFileImage, FaFileCode, FaFileExcel, FaFile } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

// Utility to get icon by extension
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

const isPreviewable = (ext) => {
  return [
    'pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'md', 'svg',
  ].includes(ext);
};

const SectionAttachments = ({
  attachments = [],
  sectionId,
  courseId,
  onUpload,
  onDelete,
  uploading,
}) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewExt, setPreviewExt] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file && onUpload) {
      await onUpload(sectionId, file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  return (
    <div className="mt-6 mb-3">
      <p className="font-semibold text-richblack-200 mb-1">Attachments:</p>
      {attachments.length > 0 ? (
        <ul className="list-none p-0">
          {attachments.map((url, idx) => {
            const filename = url.split('/').pop();
            const decodedFilename = decodeURIComponent(filename);
            const ext = getFileExt(decodedFilename);
            return (
              <li key={idx} className="flex items-center gap-3 py-1 border-b border-richblack-700 last:border-b-0">
                <span className="text-lg">{getFileIcon(ext)}</span>
                <span className="truncate max-w-[180px] text-richblack-50" title={decodedFilename}>{decodedFilename.length > 30 ? decodedFilename.slice(0, 27) + '...' : decodedFilename}</span>
                {ext && <span className="ml-1 px-2 py-0.5 bg-richblack-700 text-xs rounded text-richblack-200 uppercase">{ext}</span>}
                <button
                  className="ml-2 text-blue-400 underline text-xs"
                  onClick={() => handleView(url)}
                >
                  View
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-400 underline text-xs"
                >
                  Download
                </a>
                <button
                  className="ml-2 px-2 py-0.5 bg-pink-600 text-white rounded text-xs font-semibold hover:bg-pink-700 transition-colors"
                  onClick={() => onDelete && onDelete(sectionId, url)}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-richblack-300 text-sm">No attachments yet.</p>
      )}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="*"
        />
        <button
          type="button"
          className="px-3 py-1 bg-richblack-700 text-richblack-50 rounded font-semibold text-sm hover:bg-richblack-800"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={uploading}
        >
          {file ? 'Change File' : 'Select File'}
        </button>
        {file && (
          <div className="flex items-center gap-2 bg-richblack-800 px-2 py-1 rounded">
            <span className="truncate max-w-[120px] text-xs text-richblack-100">{file.name}</span>
            <span className="text-xs text-richblack-300">{(file.size/1024).toFixed(1)} KB</span>
            <button onClick={() => setFile(null)} className="text-pink-400 hover:text-pink-600"><AiOutlineClose /></button>
          </div>
        )}
        <button
          className="px-3 py-1 bg-yellow-50 text-richblack-900 rounded font-semibold text-sm disabled:opacity-50"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Attachment'}
        </button>
      </div>
      {/* Modal for preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-richblack-900 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col relative">
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

export default SectionAttachments; 
import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { downloadElementAsPng } from '../utils/downloadAsPng';

const DownloadPngButton = ({ targetRef, filename, className = '' }) => {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadElementAsPng(targetRef?.current, filename);
    } catch (error) {
      console.error('PNG download failed:', error);
      alert(error.message || 'Failed to download PNG');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`single-view-button single-view-button-download ${className}`.trim()}
      disabled={busy}
      title="Download as PNG"
    >
      <FaDownload aria-hidden="true" />
      <span>{busy ? 'Preparing...' : 'Download as PNG'}</span>
    </button>
  );
};

export default DownloadPngButton;

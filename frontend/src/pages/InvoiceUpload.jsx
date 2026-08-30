import React, { useState } from 'react';
import { invoiceAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles, RefreshCw, AlertCircle, FileCheck } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const InvoiceUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processingState, setProcessingState] = useState(''); // Uploading, OCR, Matching, Fraud, Done
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an invoice file first.');
      return;
    }

    setUploading(true);
    setError('');
    setProcessingState('Preprocessing & OCR Data Extraction...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => setProcessingState('Running 3-Way PO/GRN Matching Engine...'), 800);
      setTimeout(() => setProcessingState('Multi-Layer Fraud Detection & Benford Analysis...'), 1600);

      const res = await invoiceAPI.upload(formData);
      setExtractedData(res.data);
      setProcessingState('Complete!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload and OCR processing failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="p-6 glass-card rounded-3xl border border-slate-800">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          Invoice Upload & Document AI Hub
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </h2>
        <p className="text-xs text-slate-400 mt-1">Upload supplier invoices in PDF, PNG, JPG, or JSON format for automated OCR & 3-way matching.</p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="p-10 glass-panel rounded-3xl border-2 border-dashed border-slate-700 hover:border-indigo-500/80 transition-all text-center relative flex flex-col items-center justify-center space-y-4 cursor-pointer"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 glow-indigo">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Drag and drop invoice document here</h3>
          <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG, JPEG, TXT, JSON (Max file size 25MB)</p>
        </div>

        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.json"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {file && (
          <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-indigo-300 font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{file.name}</span>
            <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Process Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`px-6 py-3 rounded-2xl font-extrabold text-xs flex items-center space-x-2 transition-all ${
            uploading || !file
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white shadow-lg shadow-indigo-500/25'
          }`}
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{processingState}</span>
            </>
          ) : (
            <>
              <span>Extract & Analyze Invoice</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Extracted Data Inspector Modal / Panel */}
      {extractedData && (
        <div className="p-6 glass-card rounded-3xl border border-emerald-500/40 glow-emerald space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Extraction & Matching Complete</h3>
                <p className="text-xs text-slate-400">Invoice #{extractedData.invoice_number} successfully parsed.</p>
              </div>
            </div>
            <StatusBadge status={extractedData.status} />
          </div>

          {/* Key extracted fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Vendor Name</span>
              <span className="font-bold text-white">{extractedData.vendor_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Invoice Total</span>
              <span className="font-bold text-emerald-400">${extractedData.total_amount?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">PO Number</span>
              <span className="font-bold text-indigo-300">{extractedData.po_number || 'N/A (Non-PO)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">OCR Confidence</span>
              <span className="font-bold text-emerald-400">{extractedData.ocr_confidence}%</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => navigate(`/invoices/${extractedData.id}`)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <span>Open Full Investigation View</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceUpload;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceAPI, fraudAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { AIInvestigationPanel } from '../components/AIInvestigationPanel';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Edit3, 
  Save, 
  ArrowLeft, 
  Cpu, 
  Package, 
  Building 
} from 'lucide-react';

export const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [fraudAlert, setFraudAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  const fetchInvoiceData = async () => {
    try {
      const invRes = await invoiceAPI.getById(id);
      setInvoice(invRes.data);
      setEditForm(invRes.data);

      try {
        const fraudRes = await fraudAPI.getInvoiceFraud(id);
        setFraudAlert(fraudRes.data);
      } catch (e) {
        console.warn("No fraud alert found for invoice:", e);
      }
    } catch (err) {
      console.error("Error loading invoice detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await invoiceAPI.approve(id);
      fetchInvoiceData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Approval failed.');
    }
  };

  const handleReject = async () => {
    try {
      await invoiceAPI.reject(id, rejectReason);
      setShowRejectModal(false);
      fetchInvoiceData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Rejection failed.');
    }
  };

  const handleSaveCorrection = async () => {
    try {
      await invoiceAPI.update(id, editForm);
      setEditing(false);
      fetchInvoiceData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Update failed.');
    }
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Loading Investigation Workbench...</span>
        </div>
      </div>
    );
  }

  const matchingResult = invoice.matching_result;
  const isAuditor = user?.role === 'AUDITOR';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white">Invoice #{invoice.invoice_number}</h2>
              <StatusBadge status={invoice.status} />
              <StatusBadge status={invoice.validation_status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Supplier: <span className="text-white font-semibold">{invoice.vendor_name}</span> | PO: <span className="text-indigo-300 font-mono">{invoice.po_number || 'None'}</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isAuditor && (
          <div className="flex items-center space-x-3">
            {editing ? (
              <button
                onClick={handleSaveCorrection}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Save className="w-4 h-4" /> Save Corrections
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit Extracted Fields
              </button>
            )}

            <button
              onClick={handleApprove}
              disabled={invoice.status === 'APPROVED'}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Approve Invoice
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={invoice.status === 'REJECTED'}
              className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/40 text-rose-300 font-bold text-xs transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {/* 3-Column Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Document Preview / Text (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Original Invoice Preview
            </h3>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2 overflow-y-auto max-h-[500px]">
              <div className="text-slate-500 pb-2 border-b border-slate-800">Document File: {invoice.file_name || 'uploaded_invoice.pdf'}</div>
              <div className="text-slate-300">INVOICE: #{invoice.invoice_number}</div>
              <div className="text-slate-300">VENDOR: {invoice.vendor_name}</div>
              <div className="text-slate-300">TAX ID: {invoice.vendor_tax_id || 'TAX-889900'}</div>
              <div className="text-slate-300">PO REF: {invoice.po_number || 'N/A'}</div>
              <div className="text-slate-300">DATE: {invoice.created_at?.substring(0, 10)}</div>
              <div className="py-2 border-t border-slate-800 text-emerald-400 font-bold">TOTAL AMOUNT: ${invoice.total_amount?.toLocaleString()}</div>
              
              <div className="pt-2 text-[10px] text-slate-500 font-sans">
                OCR Confidence Score: <span className="text-emerald-400 font-bold">{invoice.ocr_confidence}%</span>
              </div>
            </div>
          </div>

          {/* Data Validation Check Results */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Field Validation Checks
            </h3>
            <div className="space-y-2 text-xs">
              {(() => {
                let checks = [];
                if (invoice.validation_notes) {
                  if (typeof invoice.validation_notes === 'object') {
                    checks = invoice.validation_notes;
                  } else {
                    try {
                      checks = JSON.parse(invoice.validation_notes);
                    } catch (e) {
                      checks = [{ field: 'note', status: invoice.validation_status || 'INFO', explanation: invoice.validation_notes }];
                    }
                  }
                }
                if (!Array.isArray(checks)) {
                  checks = [{ field: 'note', status: invoice.validation_status || 'INFO', explanation: String(invoice.validation_notes) }];
                }
                return checks.map((chk, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-2">
                    <StatusBadge status={chk.status} />
                    <div>
                      <span className="font-bold text-white uppercase text-[10px]">{chk.field}</span>
                      <p className="text-slate-300 mt-0.5">{chk.explanation}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Extracted Data & 3-Way Match (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Extracted Fields Form / Display */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Extracted Invoice Data
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block">Invoice Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.invoice_number || ''}
                    onChange={(e) => setEditForm({ ...editForm, invoice_number: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-900 border border-indigo-500 rounded-lg text-white font-bold"
                  />
                ) : (
                  <span className="font-bold text-white text-sm">{invoice.invoice_number}</span>
                )}
              </div>

              <div>
                <label className="text-slate-400 font-medium block">Vendor Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.vendor_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, vendor_name: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-900 border border-indigo-500 rounded-lg text-white font-bold"
                  />
                ) : (
                  <span className="font-bold text-white">{invoice.vendor_name}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block">PO Number</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.po_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, po_number: e.target.value })}
                      className="w-full mt-1 p-2 bg-slate-900 border border-indigo-500 rounded-lg text-white font-bold"
                    />
                  ) : (
                    <span className="font-mono text-indigo-300 font-bold">{invoice.po_number || 'N/A'}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 font-medium block">Total Amount</label>
                  {editing ? (
                    <input
                      type="number"
                      value={editForm.total_amount || 0}
                      onChange={(e) => setEditForm({ ...editForm, total_amount: parseFloat(e.target.value) })}
                      className="w-full mt-1 p-2 bg-slate-900 border border-indigo-500 rounded-lg text-white font-bold"
                    />
                  ) : (
                    <span className="font-bold text-emerald-400 text-sm">${invoice.total_amount?.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Line Items Breakdown</h4>
              <div className="space-y-2">
                {invoice.items?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{item.item_description}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{item.quantity} units x ${item.unit_price} USD</p>
                    </div>
                    <span className="font-bold text-emerald-400">${item.line_total?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Way Matching Breakdown Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                3-Way Matching Engine Matrix
              </h3>
              <StatusBadge status={matchingResult?.overall_match_status || 'NO_MATCH'} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Vendor Match</span>
                <StatusBadge status={matchingResult?.vendor_matched ? 'EXACT_MATCH' : 'NO_MATCH'} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Purchase Order Existence</span>
                <StatusBadge status={matchingResult?.po_matched ? 'EXACT_MATCH' : 'NO_MATCH'} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Goods Receipt Note (GRN) Match</span>
                <StatusBadge status={matchingResult?.grn_matched ? 'EXACT_MATCH' : 'NO_MATCH'} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Quantity Tolerance Check</span>
                <StatusBadge status={matchingResult?.quantity_matched ? 'EXACT_MATCH' : 'EXCEPTION'} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Unit Price Tolerance Check</span>
                <StatusBadge status={matchingResult?.price_matched ? 'EXACT_MATCH' : 'EXCEPTION'} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fraud Analysis & AI Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Score Gauge */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 text-center">
            <h3 className="text-sm font-bold text-white mb-4">Fraud Risk Score Breakdown</h3>
            <RiskScoreGauge score={fraudAlert?.risk_score || 0} level={fraudAlert?.risk_level || 'LOW'} />
          </div>

          {/* AI Financial Investigation Assistant */}
          <AIInvestigationPanel
            invoice={invoice}
            fraudAlert={fraudAlert}
            matchingResult={matchingResult}
          />
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Reject Invoice #{invoice.invoice_number}</h3>
            <p className="text-xs text-slate-400">Please provide a reason for rejecting this supplier invoice.</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Price exceeds Purchase Order limit by 35% without justification."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;

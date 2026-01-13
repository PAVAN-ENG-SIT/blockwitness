import React, { useEffect, useState } from "react";
import { explorer, getBlock, getBlockQr, getMerkleProof, downloadCertificate, verifyChain } from "../api";
import MerkleVisualizer from "../components/MerkleVisualizer";
import Button from "../components/Button";
import Card, { GlassCard } from "../components/Card";
import Input from "../components/Input";
import Badge from "../components/Badge";

export default function Explorer() {
  const [blocks, setBlocks] = useState([]);
  const [detail, setDetail] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [selectedLeaf, setSelectedLeaf] = useState("");
  const [proofData, setProofData] = useState(null);
  const [showMerkle, setShowMerkle] = useState(false);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBlocks(); }, []);

  async function loadBlocks() {
    setLoading(true);
    try {
      const data = await explorer();
      setBlocks(data);
    } catch (err) {
      alert("Failed to load blocks: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openBlock(idx) {
    try {
      const d = await getBlock(idx);
      setDetail(d);
      setQrData(null);
      setProofData(null);
      setShowMerkle(false);
    } catch (err) {
      alert("Failed to open block: " + err.message);
    }
  }

  async function showQr(idx) {
    try {
      const r = await getBlockQr(idx);
      setQrData(r);
    } catch (err) {
      alert("Failed to fetch QR: " + err.message);
    }
  }

  async function fetchMerkle(idx, leaf) {
    try {
      const res = await getMerkleProof(idx, leaf);
      setProofData(res);
      setShowMerkle(true);
    } catch (err) {
      alert("Failed to fetch merkle proof: " + err.message);
    }
  }

  async function downloadCert(reportId) {
    try {
      const blob = await downloadCertificate(reportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Certificate download failed: " + err.message);
    }
  }

  async function checkChain() {
    try {
      const res = await verifyChain();
      setChainStatus(res);
      if (!res.ok) {
        alert("Chain problems found; open console for details");
        console.log(res.problems);
      } else {
        alert("Chain OK — no problems detected");
      }
    } catch (err) {
      alert("Chain verify failed: " + err.message);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-extrabold gradient-text">
            Block Explorer
          </h1>
          <p className="text-dark-300 mt-2 text-lg font-medium">
            Explore the blockchain and verify evidence integrity
          </p>
        </div>
        <Button onClick={checkChain} variant="accent" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }>
          Verify Chain
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-3 max-h-[800px] overflow-y-auto pr-2">
          <h2 className="text-lg font-semibold text-dark-100 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Blocks ({blocks.length})
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : blocks.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-dark-500">No blocks yet. Create a report to start the chain.</p>
            </Card>
          ) : (
            blocks.map(b => (
              <Card
                key={b.idx}
                hover
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  detail?.idx === b.idx 
                    ? 'border-2 border-primary-500 bg-gradient-to-br from-primary-50 to-white shadow-glow' 
                    : ''
                }`}
                onClick={() => openBlock(b.idx)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-dark-100">Block #{b.idx}</h3>
                      <Badge variant="primary" size="sm">
                        {b.tx_count || 0} tx
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-dark-500">
                      Root: {b.merkle_root?.slice(0, 16)}...
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); showQr(b.idx); }}
                    className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="col-span-8">
          {detail ? (
            <GlassCard className="p-6 space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-dark-100 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
                    {detail.idx}
                  </span>
                  Block #{detail.idx}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-dark-300 mb-1">Timestamp</p>
                    <p className="text-sm font-mono text-dark-100 bg-dark-800 px-3 py-2 rounded-lg border border-dark-700">
                      {detail.timestamp}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-300 mb-1">Previous Hash</p>
                    <p className="text-xs font-mono text-dark-100 bg-dark-800 px-3 py-2 rounded-lg border border-dark-700 truncate">
                      {detail.previous_hash || 'genesis'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-dark-300 mb-1">Block Hash</p>
                    <p className="text-xs font-mono text-dark-100 bg-dark-800 px-3 py-2 rounded-lg border border-dark-700 break-all">
                      {detail.block_hash}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-dark-300 mb-1">Merkle Root</p>
                    <p className="text-xs font-mono text-dark-100 bg-dark-800 px-3 py-2 rounded-lg border border-dark-700 break-all">
                      {detail.merkle_root}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-dark-100 mb-3">Transactions</h3>
                <div className="space-y-3">
                  {detail.transactions.map(tx => (
                    <Card key={tx.tx_id} className="p-4" hover>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark-100 mb-1">{tx.title}</h4>
                          <div className="flex flex-wrap gap-2 text-xs text-dark-300">
                            <Badge variant="dark" size="sm">
                              {tx.uploader}
                            </Badge>
                            <Badge variant="primary" size="sm" className="font-mono">
                              {tx.report_id}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => downloadCert(tx.report_id)}
                          variant="primary"
                          size="sm"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          }
                        >
                          Certificate
                        </Button>
                      </div>
                    </Card>
                  ))}

                  <div className="mt-4 p-4 bg-dark-800 rounded-xl border border-dark-700">
                    <h4 className="text-sm font-semibold text-dark-100 mb-3">Generate Merkle Proof</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste leaf hash (optional, leave empty for all)"
                        value={selectedLeaf}
                        onChange={(e) => setSelectedLeaf(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => fetchMerkle(detail.idx, selectedLeaf)}
                        variant="success"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        }
                      >
                        Get Proof
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {qrData && (
                <Card className="p-6 bg-gradient-to-br from-dark-50 to-white">
                  <h4 className="font-semibold text-dark-100 mb-4">QR Code Verification</h4>
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-dark-700">
                      <img alt="qr" src={`data:image/png;base64,${qrData.qr_base64}`} className="w-48 h-48" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-dark-300 mb-2">Scan this QR code or visit:</p>
                      <a
                        className="text-primary-600 hover:text-primary-700 underline font-mono text-sm break-all"
                        href={qrData.verification_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {qrData.verification_url}
                      </a>
                    </div>
                  </div>
                </Card>
              )}
            </GlassCard>
          ) : (
            <Card className="p-12 text-center bg-gradient-to-br from-primary-50/30 to-accent-50/30 border-2 border-dashed border-primary-300">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-100 mb-2">Select a Block</h3>
              <p className="text-dark-300">
                Click on any block from the list to view its details, transactions, and verification information.
              </p>
            </Card>
          )}
        </div>
      </div>

      {showMerkle && proofData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <GlassCard className="p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-2xl font-bold text-dark-100 mb-4">Merkle Proof Verification</h3>
            <div className="mb-6 space-y-2">
              <div>
                <span className="text-sm font-medium text-dark-300">Leaf Hash:</span>
                <code className="block mt-1 px-3 py-2 bg-dark-800 rounded-lg text-xs font-mono text-dark-100 border border-dark-700 break-all">
                  {proofData.leaf}
                </code>
              </div>
              <div>
                <span className="text-sm font-medium text-dark-300">Root Hash:</span>
                <code className="block mt-1 px-3 py-2 bg-dark-800 rounded-lg text-xs font-mono text-dark-100 border border-dark-700 break-all">
                  {proofData.root}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-dark-300">Status:</span>
                <Badge variant={proofData.valid ? "success" : "danger"} size="md">
                  {proofData.valid ? "✓ Valid" : "✗ Invalid"}
                </Badge>
              </div>
            </div>
            <MerkleVisualizer proof={proofData.proof} leaf={proofData.leaf} root={proofData.root} valid={proofData.valid} />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => { setShowMerkle(false); setProofData(null); }}
                variant="ghost"
              >
                Close
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {chainStatus && (
        <Card className={`p-6 animate-scale-in ${
          chainStatus.ok 
            ? 'bg-gradient-to-br from-success-50 to-white border-2 border-success-500' 
            : 'bg-gradient-to-br from-warning-50 to-white border-2 border-warning-500'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              chainStatus.ok 
                ? 'bg-gradient-to-br from-success-500 to-success-600 shadow-success-500/30' 
                : 'bg-gradient-to-br from-warning-500 to-warning-600 shadow-warning-500/30'
            }`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {chainStatus.ok ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                )}
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-dark-100 mb-2">Chain Verification Result</h3>
              <pre className="text-sm bg-white px-4 py-3 rounded-lg border border-dark-700 overflow-x-auto">
                {JSON.stringify(chainStatus, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

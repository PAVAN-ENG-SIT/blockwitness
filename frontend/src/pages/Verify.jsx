import React, { useState } from "react";
import { verifyFile } from "../api";
import Button from "../components/Button";
import Card, { GlassCard } from "../components/Card";
import FileUpload from "../components/FileUpload";
import Badge from "../components/Badge";

export default function Verify() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await verifyFile(fd);
      setResult(r);
      setFile(null);
    } catch (err) {
      alert("Verify failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const isVerified = result?.found;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
          Verify Evidence
        </h1>
        <p className="text-dark-300 text-lg font-medium">
          Check if your file exists in the blockchain and verify its authenticity
        </p>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={submit} className="space-y-6">
          <FileUpload
            label="Select File to Verify"
            onChange={onFileChange}
            value={file ? [file] : []}
          />

          <Button
            type="submit"
            variant="success"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={!file}
            icon={
              !loading && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          >
            {loading ? "Verifying..." : "Verify File"}
          </Button>
        </form>
      </GlassCard>

      {result && (
        <Card 
          className={`p-8 animate-scale-in border-2 ${
            isVerified 
              ? 'border-success-500 bg-gradient-to-br from-success-50 to-white' 
              : 'border-danger-500 bg-gradient-to-br from-danger-50 to-white'
          }`}
        >
          <div className="flex items-start gap-4">
            <div 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isVerified 
                  ? 'bg-gradient-to-br from-success-500 to-success-600 shadow-success-500/30' 
                  : 'bg-gradient-to-br from-danger-500 to-danger-600 shadow-danger-500/30'
              }`}
            >
              {isVerified ? (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${
                isVerified ? 'text-success-700' : 'text-danger-700'
              }`}>
                {isVerified ? '✓ File Verified' : '⚠ File Not Found'}
              </h2>
              <p className="text-dark-300 mb-6">
                {isVerified 
                  ? 'This file exists in the blockchain and has not been tampered with.' 
                  : 'This file was not found in the blockchain or has been modified.'}
              </p>

              {isVerified && result.match && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">File Hash</p>
                      <code className="block px-3 py-2 bg-white rounded-lg text-xs font-mono text-dark-200 border border-dark-700 break-all">
                        {result.match.hash}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">Block Index</p>
                      <Badge variant="accent" size="lg" className="text-base">
                        #{result.match.block_index}
                      </Badge>
                    </div>
                  </div>

                  {result.match.report_id && (
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">Report ID</p>
                      <Badge variant="primary" size="lg" className="font-mono">
                        {result.match.report_id}
                      </Badge>
                    </div>
                  )}

                  {result.match.title && (
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">Report Title</p>
                      <p className="text-base text-dark-800 font-medium">{result.match.title}</p>
                    </div>
                  )}

                  {result.match.uploader && (
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">Submitted By</p>
                      <p className="text-base text-dark-800">{result.match.uploader}</p>
                    </div>
                  )}

                  {result.match.timestamp && (
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">Timestamp</p>
                      <p className="text-base text-dark-800 font-mono">{result.match.timestamp}</p>
                    </div>
                  )}

                  {result.match.merkle_root && (
                    <div>
                      <p className="text-sm font-medium text-dark-300 mb-2">Merkle Root</p>
                      <code className="block px-3 py-2 bg-white rounded-lg text-xs font-mono text-dark-200 border border-dark-700 break-all">
                        {result.match.merkle_root}
                      </code>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-success-100 border border-success-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-success-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-success-800">
                        <strong>Authenticity Confirmed:</strong> This file's cryptographic hash matches the record on the blockchain. The evidence is tamper-proof and verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isVerified && (
                <div className="mt-6 p-4 bg-danger-100 border border-danger-300 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-danger-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-danger-800">
                      <strong>Verification Failed:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>The file may have been modified or corrupted</li>
                        <li>The file was never uploaded to the blockchain</li>
                        <li>The file hash doesn't match any recorded evidence</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {!result && (
        <Card className="p-8 bg-gradient-to-br from-primary-50/30 to-accent-50/30 border-2 border-dashed border-primary-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-dark-100">How Verification Works</h3>
            <p className="text-dark-300 max-w-2xl mx-auto">
              Upload any file to compute its SHA-256 hash and compare it against all evidence stored in the blockchain. If a match is found, the file's authenticity is confirmed and you'll see all related metadata.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

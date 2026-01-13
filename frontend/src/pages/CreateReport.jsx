import React, { useState } from "react";
import { createReport } from "../api";
import Button from "../components/Button";
import Card, { GlassCard } from "../components/Card";
import Input, { TextArea } from "../components/Input";
import FileUpload from "../components/FileUpload";
import Badge from "../components/Badge";

export default function CreateReport() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [uploader, setUploader] = useState("demo_user");
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function onFiles(e) {
    setFiles(Array.from(e.target.files));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", desc);
    fd.append("uploader", uploader);
    for (const f of files) fd.append("files", f);
    try {
      const r = await createReport(fd);
      setResult(r);
      setTitle("");
      setDesc("");
      setFiles([]);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="text-5xl font-extrabold gradient-text">
          Create Incident Report
        </h1>
        <p className="text-dark-300 text-lg font-medium">
          Secure your evidence with tamper-proof blockchain technology
        </p>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={submit} className="space-y-6">
          <Input
            label="Report Title"
            placeholder="Enter a descriptive title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          <TextArea
            label="Description"
            placeholder="Provide detailed information about the incident..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            required
          />

          <Input
            label="Submitted By"
            placeholder="Your name or ID..."
            value={uploader}
            onChange={(e) => setUploader(e.target.value)}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <FileUpload
            label="Evidence Files"
            multiple
            onChange={onFiles}
            value={files}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="flex-1"
              icon={
                !loading && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            >
              {loading ? "Creating Report..." : "Submit Report"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                setTitle("");
                setDesc("");
                setFiles([]);
                setResult(null);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </GlassCard>

      {result && (
        <Card className="p-6 animate-scale-in" glow>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-success-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-dark-100 mb-2">
                Report Created Successfully!
              </h2>
              <p className="text-dark-300 mb-4">
                Your evidence has been securely recorded on the blockchain.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-dark-200 w-32">Report ID:</span>
                  <Badge variant="primary" size="md" className="font-mono">
                    {result.report_id}
                  </Badge>
                </div>
                
                {result.block_index !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-dark-200 w-32">Block Index:</span>
                    <Badge variant="accent" size="md">
                      #{result.block_index}
                    </Badge>
                  </div>
                )}
                
                {result.merkle_root && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-dark-200 w-32">Merkle Root:</span>
                    <code className="px-3 py-1.5 bg-dark-800/70 rounded-lg text-xs font-mono text-dark-200 border border-dark-700">
                      {result.merkle_root.slice(0, 20)}...
                    </code>
                  </div>
                )}
                
                {result.evidence && result.evidence.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-dark-200 mb-2 block">Evidence Files:</span>
                    <div className="space-y-2">
                      {result.evidence.map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl border border-dark-700">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-dark-100">{ev.filename}</p>
                            <p className="text-xs text-dark-500 font-mono">Hash: {ev.hash.slice(0, 16)}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-primary-800">
                    You can verify this evidence anytime using the Verify page. Keep your Report ID safe for future reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

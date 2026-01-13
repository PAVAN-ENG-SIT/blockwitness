import React, { useEffect, useState } from "react";
import { getTimeline } from "../api";
import Card from "../components/Card";
import Badge from "../components/Badge";

export default function Timeline() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getTimeline();
      setBlocks(res);
    } catch (err) {
      alert("Failed to load timeline: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
          Chain Timeline
        </h1>
        <p className="text-dark-300 text-lg font-medium">
          Complete chronological history of all blocks and transactions
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 mx-auto border-4 border-primary-500 border-t-transparent rounded-full"></div>
            <p className="text-dark-300">Loading timeline...</p>
          </div>
        </div>
      ) : blocks.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-dark-50 to-white">
          <div className="w-16 h-16 mx-auto bg-dark-200 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-100 mb-2">No Blocks Yet</h3>
          <p className="text-dark-300">
            Create your first report to start the blockchain timeline.
          </p>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500"></div>

          <div className="space-y-8">
            {blocks.map((b, idx) => (
              <div key={b.idx} className="relative pl-20 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="absolute left-0 top-0 w-16 h-16 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-glow border-4 border-white z-10">
                  {b.idx}
                </div>

                <Card hover className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-dark-100 mb-2">Block #{b.idx}</h3>
                      <div className="flex items-center gap-2 text-sm text-dark-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {b.timestamp}
                      </div>
                    </div>
                    <Badge variant="primary" size="md">
                      {b.transactions.length} {b.transactions.length === 1 ? 'Transaction' : 'Transactions'}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-dark-300 mb-1">Block Hash</p>
                    <code className="block px-3 py-2 bg-dark-800 rounded-lg text-xs font-mono text-dark-200 border border-dark-700 break-all">
                      {b.block_hash}
                    </code>
                  </div>

                  {b.transactions.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-dark-100 mb-3">Transactions</p>
                      <div className="space-y-2">
                        {b.transactions.map(tx => (
                          <div key={tx.tx_id} className="flex items-start gap-3 p-3 bg-dark-800 rounded-lg border border-dark-700 hover:bg-dark-800/70 transition-colors">
                            <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-dark-100">{tx.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-dark-300">
                                <span>By {tx.uploader}</span>
                                <span>•</span>
                                <code className="text-dark-500">{tx.tx_id.slice(0, 8)}...</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

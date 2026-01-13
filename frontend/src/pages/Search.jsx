import React, { useState } from "react";
import { searchReports } from "../api";
import Button from "../components/Button";
import Card, { GlassCard } from "../components/Card";
import Input from "../components/Input";
import Badge from "../components/Badge";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query) return setResults([]);
    setLoading(true);
    try {
      const res = await searchReports(query);
      setResults(res || []);
    } catch (err) {
      alert("Search failed: " + err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
          Search Reports
        </h1>
        <p className="text-dark-300 text-lg font-medium">
          Find reports by title, uploader, transaction ID, or block number
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="flex gap-3">
          <Input
            placeholder="Search by title, uploader, tx_id, block..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <Button
            onClick={handleSearch}
            variant="primary"
            loading={loading}
            icon={
              !loading && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            }
          >
            Search
          </Button>
        </div>
      </GlassCard>

      {query && results.length === 0 && !loading && (
        <Card className="p-12 text-center bg-gradient-to-br from-dark-50 to-white animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-dark-200 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-100 mb-2">No Results Found</h3>
          <p className="text-dark-300">
            Try searching with different keywords or check the blockchain explorer.
          </p>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-100">
              Found {results.length} {results.length === 1 ? 'result' : 'results'}
            </h2>
          </div>

          {results.map((r, idx) => (
            <Card key={r.tx_id} hover className="p-6 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-dark-100 mb-2">{r.title}</h3>
                  {r.description && (
                    <p className="text-dark-300 mb-4">{r.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" size="sm" className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {r.uploader}
                    </Badge>
                    <Badge variant="accent" size="sm">
                      Block #{r.block_index}
                    </Badge>
                    <Badge variant="dark" size="sm" className="font-mono text-xs">
                      {r.tx_id}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!query && !loading && (
        <Card className="p-12 text-center bg-gradient-to-br from-primary-50/30 to-accent-50/30 border-2 border-dashed border-primary-300">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-dark-100 mb-2">Search the Blockchain</h3>
          <p className="text-dark-300 max-w-md mx-auto">
            Enter keywords to search through all recorded reports, evidence, and transactions on the blockchain.
          </p>
        </Card>
      )}
    </div>
  );
}

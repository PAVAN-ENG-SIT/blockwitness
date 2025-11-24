// frontend/src/api.js
const API_BASE = "https://blockwitness.onrender.com/api";



async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(()=>"(no body)");
    throw new Error(`Request failed ${res.status} ${res.statusText} -> ${txt}`);
  }
  return res;
}

// -----------------
// REPORTS
// -----------------
export async function createReport(formData) {
  const res = await fetchJson(`${API_BASE}/report`, { method: "POST", body: formData });
  return res.json();
}

export async function searchReports(query) {
  const res = await fetchJson(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function downloadCertificate(reportId) {
  const url = `${API_BASE}/report/${encodeURIComponent(reportId)}/certificate`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Certificate download failed");
  return res.blob();
}

// -----------------
// BLOCKCHAIN DATA
// -----------------
export async function explorer() {
  const res = await fetchJson(`${API_BASE}/explorer`);
  return res.json();
}

export async function getBlock(idx) {
  const res = await fetchJson(`${API_BASE}/block/${idx}`);
  return res.json();
}

export async function getBlockQr(idx) {
  const res = await fetchJson(`${API_BASE}/block/${idx}/qr`);
  return res.json();
}

export async function getMerkleProof(blockIdx, leaf) {
  const url = `${API_BASE}/block/${blockIdx}/merkle?leaf=${encodeURIComponent(leaf || "")}`;
  const res = await fetchJson(url);
  return res.json();
}

export async function verifyFile(formData) {
  const res = await fetchJson(`${API_BASE}/verify`, { method: "POST", body: formData });
  return res.json();
}

// -----------------
// CHAIN OPERATIONS
// -----------------
export async function getTimeline() {
  const res = await fetchJson(`${API_BASE}/chain/timeline`);
  return res.json();
}

export async function verifyChain() {
  const res = await fetchJson(`${API_BASE}/chain/verify`);
  return res.json();
}

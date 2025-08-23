import os, json, hashlib, time
from pathlib import Path

ROOT = Path('.')
OUT = ROOT / 'proofs'
OUT.mkdir(exist_ok=True)

# Collect artifacts to attest (adjust as needed)
# current deploy: single-file canvas
patterns = ['index.html']            # add more like 'assets/**/*' if you add files
# later for Vite build:
# patterns = ['dist/**/*']
files = sorted(files, key=lambda p: p.as_posix())

files = []
for pat in patterns:
    for p in ROOT.glob(pat):
        if p.is_file():
            files.append(p)

def sha256_file(path: Path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1<<20), b''):
            h.update(chunk)
    return h.hexdigest()

# HASHES.txt
lines, hashes = [], []
for p in files:
    h = sha256_file(p)
    lines.append(f"{h}  {p.as_posix()} ({p.stat().st_size} bytes)")
    hashes.append((p.as_posix(), h))
(OUT / 'HASHES.txt').write_text("\n".join(lines) if lines else "No artifacts found.", encoding='utf-8')

# Merkle
def merkle_root(hex_list):
    if not hex_list: return None, []
    lvl = [bytes.fromhex(x) for x in hex_list]
    lvls = [[x.hex() for x in lvl]]
    while len(lvl) > 1:
        nxt = []
        for i in range(0, len(lvl), 2):
            a = lvl[i]
            b = lvl[i+1] if i+1 < len(lvl) else lvl[i]
            nxt.append(hashlib.sha256(a+b).digest())
        lvl = nxt
        lvls.append([x.hex() for x in lvl])
    return lvl[0].hex(), lvls

root, lvls = merkle_root([h for _, h in hashes])
merkle = {
    "algorithm": "sha256",
    "leaves": [{"file": f, "sha256": h} for f, h in hashes],
    "levels": lvls,
    "merkle_root": root
}
(OUT / 'MERKLE.json').write_text(json.dumps(merkle, indent=2), encoding='utf-8')

# SBOM (minimal)
sbom = {
  "bomFormat": "CycloneDX", "specVersion": "1.4", "version": 1,
  "metadata": {"timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
  "components": [
    {"type":"library","name":"three","version":"0.158.0","purl":"pkg:npm/three@0.158.0"},
    {"type":"library","name":"vite","version":"^5.0.0","purl":"pkg:npm/vite@5.0.0"}
  ]
}
(OUT / 'SBOM.json').write_text(json.dumps(sbom, indent=2), encoding='utf-8')

# Attestation
att = {
  "_type": "https://in-toto.io/Statement/v1",
  "predicateType": "https://slsa.dev/provenance/v1",
  "subject": [{"name": f, "digest": {"sha256": h}} for f, h in hashes],
  "predicate": {
    "buildType": "https://slsa.dev/container-based-build/v1#vite-gh-pages",
    "builder": {"id": "github-actions://ttd-proofs"},
    "metadata": {"invocationId": f"ttd-proofs-{int(time.time())}"}
  }
}
(OUT / 'ATTESTATION.json').write_text(json.dumps(att, indent=2), encoding='utf-8')

# Docs
(OUT / 'README.md').write_text("Proofs generated via GitHub Actions. Verify hashes in HASHES.txt.", encoding='utf-8')
print("Proofs generated into", OUT.as_posix())

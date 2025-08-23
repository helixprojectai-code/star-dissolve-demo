import os, json, hashlib, time
from pathlib import Path

ROOT = Path('.')
OUT = ROOT / 'proofs'
OUT.mkdir(exist_ok=True)

# Current deploy = single-file Canvas page; adjust when Vite/dist is live.
patterns = ['index.html']              # later: patterns = ['dist/**/*']

files = []
for pat in patterns:
    for p in ROOT.glob(pat):
        if p.is_file():
            files.append(p)

# Make ordering stable (deterministic Merkle/HASHES)
files = sorted(files, key=lambda p: p.as_posix())

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

# Merkle (works even if 0 or 1 leaves)
def merkle_root(hex_list):
    if not hex_list: return None, []
    lvl = [bytes.fromhex(x) for x in hex_list]
    lvls = [[x.hex() for x in lvl]]
    while len(lvl) > 1:
        nxt = []
        for i in

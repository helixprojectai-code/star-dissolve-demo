# TTD Proofs Setup v0.1.0
This folder contains a drop-in GitHub Actions workflow and generator script.

## Install
- Create `scripts/generate_proofs.py` in your repo with the provided content.
- Create `.github/workflows/ttd-proofs.yml` with the provided content.
- Commit to `main`.

## Use
- Push to `main`: updates `proofs/` in the repo and uploads a CI artifact.
- Push a tag (e.g., `v1.0.0`): also creates a GitHub Release with `ttd_proofs_pack.zip` attached.

## Proofs & Verification

**Artifacts:** see [/proofs](./proofs). Each run publishes a signed pack and CI self-verifies signatures.

### Integrity (SHA-256)
# Windows (PowerShell)
Get-FileHash "$env:TEMP\index.html" -Algorithm SHA256
# or download the deployed page then hash:
Invoke-WebRequest -Uri "https://helixprojectai-code.github.io/star-dissolve-demo/index.html" -OutFile "$env:TEMP\index.html"
Get-FileHash "$env:TEMP\index.html" -Algorithm SHA256
# Compare to /proofs/HASHES.txt

### Sigstore keyless (CI self-verify mirrors these)
cosign verify-blob ^
  --certificate proofs/ATTESTATION.json.cert ^
  --signature   proofs/ATTESTATION.json.sig ^
  --certificate-identity "https://github.com/helixprojectai-code/star-dissolve-demo/.github/workflows/ttd-proofs.yml@refs/heads/main" ^
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" ^
  proofs/ATTESTATION.json

cosign verify-blob ^
  --certificate proofs/ttd_proofs_pack.zip.cert ^
  --signature   proofs/ttd_proofs_pack.zip.sig ^
  --certificate-identity "https://github.com/helixprojectai-code/star-dissolve-demo/.github/workflows/ttd-proofs.yml@refs/heads/main" ^
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" ^
  ttd_proofs_pack.zip

[![TTD Proofs — build & publish](https://github.com/helixprojectai-code/star-dissolve-demo/actions/workflows/ttd-proofs.yml/badge.svg)](../../actions)

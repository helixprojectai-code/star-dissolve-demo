# TTD Proofs Setup
This folder contains a drop-in GitHub Actions workflow and generator script.

## Install
- Create `scripts/generate_proofs.py` in your repo with the provided content.
- Create `.github/workflows/ttd-proofs.yml` with the provided content.
- Commit to `main`.

## Use
- Push to `main`: updates `proofs/` in the repo and uploads a CI artifact.
- Push a tag (e.g., `v1.0.0`): also creates a GitHub Release with `ttd_proofs_pack.zip` attached.

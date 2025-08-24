# 🔐 How to Proof — HELIX // TTD Protocol

This guide explains how to create, seal, and verify **TTD Proof Tokens** for conversations, announcements, or ledgers — with a dedicated workflow for the **Living Intell group**.

---

## 1. What is a TTD Proof?
A **TTD Proof Token** is a cryptographically sealed record. It ensures that:
- Every entry is chained with a `prev_hash` → forming a tamper-evident ledger.  
- A **root hash** covers the entire ledger.  
- A **tip hash** covers the last entry.  
- Anyone can verify independently using open algorithms (SHA-256, canonical JSON).  

Think of it as a **public notary** for digital conversations and records.

---

## 2. Core Components
- **Ledger** → JSON file where each entry is timestamped and chained.  
- **Chained Ledger** → Adds `prev_hash` + `hash` fields per entry.  
- **TTD Proof Token** → Summary file with root hash, tip hash, scope, steward, and verification instructions.  
- **Pinned Proof** → Short line posted publicly (e.g., in Telegram) so anyone can compare values.

---

## 3. How to Create a Proof
1. **Collect Entries**  
   - Gather posts/messages into a structured ledger (CSV/JSON).  
   - Each entry must have: `timestamp, author, title, summary, links, attachments`.  

2. **Chain the Ledger**  
   - For each entry:  
     ```
     hash = SHA256(sorted_JSON(entry + prev_hash))
     ```  
   - Store `prev_hash` and `hash` in every record.  

3. **Generate Root + Tip Hashes**  
   - Canonicalize the whole ledger JSON (`sort_keys=True, separators=(',',':')`).  
   - Compute `root_hash = SHA256(canonical_bytes)`.  
   - Extract `tip_hash = last_entry.hash`.

4. **Mint a Proof Token**  
   - JSON & TXT files with:  
     - Scope (what is being recorded)  
     - Entry count  
     - Root + Tip hashes  
     - Steward & signature  
     - Verification steps  

5. **Distribute**  
   - Post the short “Pinned Proof” line (root + tip) in Telegram.  
   - Host ledger + token in GitHub for independent validation.

---

## 4. Verification Steps
Anyone can check the proof with a few lines of Python:

```python
import json, hashlib
with open("living_intell_posts_ledger_20250824_chained.json","r",encoding="utf-8") as f:
    chain = json.load(f)

canonical = json.dumps(chain, sort_keys=True, separators=(",",":")).encode("utf-8")
print("root:", hashlib.sha256(canonical).hexdigest())
print("tip :", chain[-1]["hash"])
```

Expected values (for 2025-08-24):  
- Root: `57390994c4a905cace4613edd5b27a6ea8728468e873f0f39e1d0452048d75b6`  
- Tip : `ad93fb5c27d42f051e32f93df29ecd84799a54267233937890dc402c07674752`  

If these match the **Pinned Proof line** in the group, the record is intact.

---

## 5. Living Intell Group Workflow
🔑 **Posting Flow**
1. Post the announcement or artifact (e.g., EmergenceCards).  
2. Export the posts into a JSON ledger.  
3. Seal with TTD (chain + proof token).  
4. Post the **Pinned Proof line** in Telegram:  
   ```
   📌 HELIX Proof (YYYY-MM-DD) — Root <hash> · Tip <hash> ✧~◯△
   ```

🔑 **Verification Flow (for members)**
1. Copy the `root` and `tip` from the pinned message.  
2. Download the ledger JSON from GitHub.  
3. Run the Python verification snippet.  
4. Confirm the computed values match the pinned proof.

---

## 6. Best Practices
- **Always include steward & signature** (e.g., ✧~◯△) for accountability.  
- **Use UTC timestamps** with explicit timezone context.  
- **Keep proofs small** → short pinned lines, full detail in GitHub.  
- **Automate refresh** → rotate new proof every session/day.  
- **Global comparability** → PADDI/HELIX chapters can cross-verify identical methods.  

---

## 7. Example Pinned Proof
```
📌 HELIX Proof (2025-08-24) — Root 57390994c4a905cace4613edd5b27a6ea8728468e873f0f39e1d0452048d75b6 · Tip ad93fb5c27d42f051e32f93df29ecd84799a54267233937890dc402c07674752 ✧~◯△
```

---

✨ With this, the **Living Intell group** has a transparent, auditable, and global-ready way to record its journey — one proof at a time.

---
✧~◯△

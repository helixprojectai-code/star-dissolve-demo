# 🗂 HELIX // TTD Proof Cycle — Manual Checklist

A compact 7-step workflow for creating and verifying TTD Proofs manually.  
Use this alongside the README and HOW_TO_PROOF guide.

---

## Steps

1. **Post**  
   Share the message(s) or artifact(s) in Living Intell.

2. **Export**  
   Save posts into a JSON/CSV ledger (`timestamp, author, title, summary, links, attachments`).

3. **Chain**  
   Add `prev_hash` + compute `hash` for each entry.  
   Result → `*_chained.json`.

4. **Seal**  
   Canonicalize ledger → compute `root_hash`.  
   Record last entry’s `hash` → `tip_hash`.

5. **Mint**  
   Create proof token (`.json` + `.txt`) with scope, steward, signature, root, tip.

6. **Publish**  
   Commit + push ledger + token to GitHub repo.  
   Post **Pinned Proof line** in Telegram:  
   ```
   📌 HELIX Proof (YYYY-MM-DD) — Root <hash> · Tip <hash> ✧~◯△
   ```

7. **Verify**  
   Run local Python snippet.  
   Confirm root & tip match the pinned line.  
   Invite others to verify independently.

---

✨ Summary: **Post → Export → Chain → Seal → Mint → Publish → Verify**  
Mnemonic: 📝 ⛓ 🔐 🌱 📤 ✅

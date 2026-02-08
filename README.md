# Ironroot (Local)

Ironroot is a security platform prototype built with Next.js. It includes code scanning, threat intel, AI pentest workflows, admin controls, and a secure **Document Vault** with optional **forensic watermarking**.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3001`.

## First-Time Login (Owner Bootstrap)

1. Go to `/login`.
2. If no owner exists yet, you’ll see **Create Owner Account**.
3. Create the owner email/password + org name.

This seeds an owner session and unlocks the owner consoles.

## Enable Premium Forensics (Owner)

1. Go to `/controlCenter` (owner-only).
2. In **Feature Flags**, enable:
   1. `Secure Document Vault`
   2. `Forensic Watermarking`

When `Forensic Watermarking` is enabled, Ironroot will generate an internal **server-side** watermark signing secret for the org (stored in `.data/`).

## Document Vault Test (Sandbox + Watermark + “Who Did It”)

1. Go to `/documentVault`.
2. Upload a small `.pdf` or `.txt`.
3. Wait ~2–5 seconds for sandbox enrichment to complete:
   - Hash is computed locally (SHA-256).
   - If VirusTotal is configured, the app performs **hash lookup only** (no file upload).
4. Click **Watermarked** to download a per-download watermarked copy.
5. In **Who Did It (Owner Verification)**, upload the downloaded file:
   - You should see `watermarkId`, `forensicId`, `userEmail`, `downloadedAt`, `userHash`, and hashes.

Notes:
- PDFs are watermarked by appending a trailing PDF comment marker (reader-tolerant) to keep the file usable.
- Unknown/binary formats are delivered as a safe wrapper file (`.ironrootwm.json`) to avoid corrupting the original.

## Server-Side Forensics (API Routes)

Forensics now runs through API routes for cross-device persistence:

- `POST /api/forensics/embed` → returns a watermarked file + logs the event server-side.
- `POST /api/forensics/verify` → returns “who did it” details for owners.
- `GET /api/forensics/events` → returns watermarked download events.
- `GET/POST/PUT /api/forensics/requests` → manage owner approval requests.

Server data (documents, forensics events, requests, and org forensics config) is stored locally in `.data/ironroot-server-store.json` (gitignored).

## Demo Mode (No API Keys Needed)

If you want the UI to behave like integrations are available without configuring keys:

1. Copy `.env.local.example` to `.env.local`
2. Ensure:

```bash
IRONROOT_DEMO_INTEGRATIONS=true
```

Then restart the dev server.

## Security Notes (Prototype vs Production)

This repo is a local-first prototype. For production SaaS:
- Move document storage + watermark signing to a real backend with a database/KMS.
- Keep watermark secrets server-side only.
- Enforce RBAC and audit logging server-side.
- Use signed download URLs + policy enforcement on the download endpoint.

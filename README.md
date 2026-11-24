# CANTRAL CONTROLE — LOJA (V1)

Starter app for the shop-side receipt workflow. This version has a working interface, note search, note entry for testing, pickup-person field, and cancellation with reason. Browser localStorage is used for demo persistence, so data is local to that browser/device and is not yet shared between computers or connected to the sales system.


## Deploy on Render
- Create a GitHub repository named `cantral-controle-loja`.
- Upload all files and folders from this package into the repository root (not the enclosing zip folder).
- In Render, create a Web Service from that repo. Render can detect `render.yaml`; if asked, use build command `npm install && npm run build` and start command `npm start`.
- Health endpoint: `/api/health`.

## Integration status
Automatic capture from the store's existing receipt/sales website is not implemented yet. It depends on identifying that software and whether it provides an API, webhook, export, or another supported integration. Do not enter real customer data into this prototype until a shared backend and access controls are configured.

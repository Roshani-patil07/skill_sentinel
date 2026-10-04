# SKILL-SENTINEL: Security Architecture & Cryptographic Integrity

---

## 1. Role-Based Access Control (RBAC) Matrix

| Role | View National Grid | Dispatch Interventions | Scan QR / Field Audit | Manage Users |
| :--- | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | Yes | Yes | Yes | Yes |
| **NATIONAL_OFFICER** | Yes | Yes | View Only | No |
| **STATE_OFFICER** | State Only | State Only | View Only | No |
| **DISTRICT_OFFICER** | District Only | District Only | View Only | No |
| **INSPECTION_OFFICER**| Assigned | No | Yes (Execute & Submit) | No |
| **CENTRE_ADMIN** | Own Centre | No | Self-Audit Only | No |

---

## 2. Cryptographic Asset Verification (Tamper-Proof QR)

To prevent centre administrators from photocopying or spoofing QR codes:
1. **HMAC-SHA256 Signatures**: Each QR code payload contains:
   $$\text{Payload} = \text{AssetID} \,\|\, \text{SanctionYear} \,\|\, \text{GeoFence} \,\|\, \text{HMAC}(\text{SecretKey}, \text{Metadata})$$
2. **Geo-Fencing Validation**:
   - The field inspection app captures GPS coordinates during scanning.
   - Verification fails if the scan location exceeds a 200-meter radius from the registered centre coordinates.
3. **Double Verification (QR + AI Vision)**:
   - Scanning the QR confirms registration in the central inventory.
   - The camera stream confirms physical object presence in the sanctioned lab area, preventing assets from being temporarily borrowed or ghosted.

---

## 3. Network & Transport Security

- **Enforced HTTPS & WSS**: Encrypted transit prevents eavesdropping and man-in-the-middle attacks.
- **Starlette-Compliant Strict CORS**: Explicit origin whitelisting prevents cross-origin unauthorized script execution.
- **Secret Hygiene**: Zero hardcoded credentials committed in git; all keys passed via environment variables.

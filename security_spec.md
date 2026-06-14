# Firestore Security Specification

This security specification implements zero-trust security architecture for `sauvikdev.in` client message collections.

## 1. Data Invariants
* **Inquiry messages** may be submitted anonymously (or as guests) if authentication is optional, but if restricted, they are written securely. Since this portfolio operates a visitor inquiry box, `creates` are allowed publicly underneath strict length, formatting, and rate validation.
* **Metadata protection**: Visitors cannot update or delete messages, and cannot read other visitors' messages.
* **Admin Privilege**: Reading all messages, updating statuses, or deleting messages is restricted to Sauvik (the Admin), authenticated securely via database document role lookup or direct admin-configured UID/emails.
* **Temporal Integrity**: `timestamp` field on creation must equal the `request.time` exactly.
* **Size Enforcement**: Fields like `name` and `message` must be constrained to safe small sizes to prevent Denial of Wallet storage abuse.

## 2. The "Dirty Dozen" Payloads
The following payloads are designed to attack/bypass safety controls and must be rejected by the security rules:

1. **The Ghost Field (Shadow Update)**: Attempting to insert a shadow admin privilege flag or custom field:
   ```json
   { "name": "Hack", "email": "h@ck.co", "message": "msg", "isAdmin": true, ... }
   ```
2. **Identity Spoofing**: Attempting to set `status` directly to `"read"` during submission:
   ```json
   { "name": "Attacker", "email": "a@t.co", "message": "msg", "status": "read" }
   ```
3. **Denial of Wallet (ID Poisoning)**: Designing a malicious message document with a 1.5KB long randomized symbol ID (e.g., `messages/$$$$...$$$`).
4. **Denial of Wallet (Huge String)**: Injecting a 10MB document payload in `message` field.
5. **NoSQL Injection / Enum Spoofing**: Setting `status` to an unsupported value like `"archived"` or `true`.
6. **Temporal Spoofing (Future Timestamp)**: Providing a client-generated timestamp in the future to bypass chronological filtering.
7. **PII Bulk Extraction Query**: Attempting to call `getDocs(collection(db, 'messages'))` without admin verification.
8. **PII Single Target Read**: Direct `getDoc(doc(db, 'messages', 'some_id'))` as a standard non-admin visitor.
9. **Relational Invalidation (Null email)**: Creating message with a null/missing email or wrong schema types.
10. **Malicious Browser Agent Injection**: Injecting a massive binary blob into the `browserInfo` field.
11. **Malicious Source Website**: Setting `sourceWebsite` to an arbitrary external URL like `http://malicious.com`.
12. **Malicious Unauthorized Deletion**: Bypassing the client dashboard and issuing `deleteDoc(doc(db, 'messages', 'msg-123'))` as a visitor.

## 3. Security Rules Matrix
| Collection | Resource | Action | Rule Enforced |
| :--- | :--- | :--- | :--- |
| `/messages/{messageId}` | Message | `create` | Enforced strict key schema size & types; `status` must be `unread`; `timestamp` must match `request.time`. |
| `/messages/{messageId}` | Message | `read` / `list` | Allowed only for verified admins (uid listed in `/admins/{uid}`). |
| `/messages/{messageId}` | Message | `update` | Allowed only for verified admins. State fields restricted during updates. |
| `/messages/{messageId}` | Message | `delete` | Allowed only for verified admins. |

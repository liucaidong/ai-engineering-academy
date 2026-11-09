# NIST Reference Canonicalization and Version Update Report

- Review date: 2026-11-10
- Scope: six NIST URLs were reported as HTTP 404 by the first HEAD-only crawl. A follow-up GET request to each original URL returned HTTP 200. They were **not dead links**; the original result was a HEAD-method false positive.
- Disposition: canonicalize selected URLs to official DOIs/current project pages, and update references where a newer publication supersedes the cited revision. The source corrections remain useful even though the original links were GET-reachable.

| Original source | HEAD result | GET result | Current reference | Disposition |
|---|---:|---:|---|---|
| NIST SSDF project page (`/Projects/ssdf`) | 404 | 200 | [NIST SSDF project page](https://csrc.nist.gov/projects/ssdf) | Use canonical lowercase route. The page lists SP 800-218 v1.1 and SP 800-218A GenAI/dual-use foundation-model profile. |
| SP 800-190 Application Container Security Guide | 404 | 200 | [NIST SP 800-190 DOI](https://doi.org/10.6028/NIST.SP.800-190) | Canonical DOI; same final publication. The DOI now returns HTTP 206 to the audit client's ranged GET, which is a successful partial-content response. |
| SP 800-207 Zero Trust Architecture | 404 | 200 | [NIST SP 800-207 DOI](https://doi.org/10.6028/NIST.SP.800-207) | Canonical DOI; same final 2020 publication. The DOI now returns HTTP 206 to the audit client's ranged GET. |
| SP 800-53 Rev.5 Update 1 | 404 | 200 | [NIST CPRT catalog](https://csrc.nist.gov/Projects/cprt/catalog) | Version update: current catalog release is SP 800-53 Rev.5 Release 5.2.0 (final, 2025-08-26). |
| SP 800-57 Part 1 Rev.5 | 404 | 200 | [NIST SP 800-57 Part 1 Rev.5 DOI](https://doi.org/10.6028/NIST.SP.800-57pt1r5) | Canonical DOI. Rev.5 remains final; Rev.6 is only an Initial Public Draft dated 2025-12-05, with comments closed 2026-02-05. The DOI returns HTTP 206 to ranged GET. |
| SP 800-61 Rev.2 Incident Handling Guide | 404 | 200 | [NIST SP 800-61 Rev.3 final](https://csrc.nist.gov/pubs/sp/800/61/r3/final) | Version update: Rev.3 was finalized in April 2025 and supersedes Rev.2; lesson and guide align with CSF 2.0. |

## Claim-level dispositions

- SP 800-190 supports container security concerns and recommendations for planning, implementing and maintaining containers.
- SP 800-207 supports resource-centric zero trust and authentication/authorization before access to enterprise resources.
- SP 800-53 Release 5.2.0 is the current catalog release; NIST's CPRT catalog is the current control reference.
- SP 800-57 Part 1 Rev.5 remains the final publication; Rev.6 must not be described as final.
- SP 800-61 Rev.3 supersedes Rev.2 and integrates incident response into CSF 2.0 cybersecurity risk management.
- The SSDF project page includes the GenAI-specific SP 800-218A Community Profile alongside SP 800-218 v1.1.

All nine affected lesson-level rows are recorded as `VERIFIED_NIST_SOURCE_UPDATE` in `docs/CURRICULUM_CLAIM_SOURCE_TRACEABILITY.csv`. The report preserves the original HEAD-only false positives and the subsequent GET verification.

import {
  CONTACT_EMAIL,
  CONTACT_URL,
  GITHUB_URL,
  LEGAL_LAST_UPDATED,
  OPERATOR_NAME,
  PRODUCT_NAME,
  PRODUCT_SLUG,
  TWITTER_URL,
} from "../lib/legal-meta";

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>
      <p>
        This Privacy Policy describes how {PRODUCT_NAME} (&quot;{PRODUCT_NAME}&quot;, &quot;we&quot;, &quot;us&quot;,
        &quot;our&quot;) — operated by {OPERATOR_NAME} (&quot;Operator&quot;) — handles information when you use the{" "}
        {PRODUCT_SLUG} web application, related pages, APIs, and self-hosted deployments that reference this policy.
      </p>
      <p>
        <strong>Important:</strong> This document is provided for transparency. It is not legal advice. If you need advice
        about your obligations (including GDPR, UK GDPR, CCPA/CPRA, PIPEDA, LGPD, or other laws), consult a qualified
        professional in your jurisdiction.
      </p>

      <h2>1. Who is responsible for your data?</h2>
      <p>
        <strong>Data controller</strong> (for processing we determine): {OPERATOR_NAME}. Contact:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>,{" "}
        <a href={CONTACT_URL}>{CONTACT_URL.replace(/^https?:\/\//, "")}</a>.
      </p>
      <p>
        If you access FontOps through a third-party host (fork, mirror, or employer deployment), that party may act as a
        separate or joint controller for hosting logs and infrastructure data. Check their privacy policy as well.
      </p>

      <h2>2. Summary</h2>
      <ul>
        <li>
          <strong>Default:</strong> Inspect, subset, convert, variable instancing, and specimen preview run in your
          browser. Font file bytes are not sent to our servers for those features.
        </li>
        <li>
          <strong>Opt-in QA:</strong> Only if you enable server-side QA/TTX/shaping, font files are transmitted to the
          worker endpoint you use (ours or self-hosted).
        </li>
        <li>
          <strong>No sale of font data:</strong> We do not sell or rent your font files or personal data.
        </li>
        <li>
          <strong>No advertising trackers</strong> in the open-source build described in this repository.
        </li>
      </ul>

      <h2>3. Information we process</h2>
      <h3>3.1 Information you provide</h3>
      <ul>
        <li>Font files you upload, drag-and-drop, or load via URL (processed locally unless you opt in to QA).</li>
        <li>Subset text, codepoints, and settings you enter in the UI.</li>
        <li>Communications you send us (email, security reports, GitHub issues).</li>
      </ul>
      <h3>3.2 Information collected automatically</h3>
      <ul>
        <li>
          <strong>Hosting / CDN logs:</strong> IP address, user-agent, request path, timestamps, HTTP status — standard
          web server logs if you use a hosted deployment.
        </li>
        <li>
          <strong>Local storage:</strong> The reference build does not require accounts. Future versions may store
          preferences locally in your browser only.
        </li>
      </ul>
      <h3>3.3 Information we do not intentionally collect</h3>
      <ul>
        <li>We do not log font binary contents on the reference worker configuration.</li>
        <li>We do not require real-name accounts for basic use.</li>
        <li>We do not knowingly collect data from children under 16 (see Section 10).</li>
      </ul>

      <h2>4. How we use information</h2>
      <p>We use information only as needed to:</p>
      <ul>
        <li>Provide and improve FontOps functionality;</li>
        <li>Operate optional server-side QA, TTX export, and cmap checks when you opt in;</li>
        <li>Secure the service, prevent abuse, and debug errors (metadata only);</li>
        <li>Comply with law and enforce our Terms;</li>
        <li>Respond to your requests and security reports.</li>
      </ul>
      <p>
        <strong>Legal bases (EEA/UK, where applicable):</strong> performance of a contract or steps at your request
        (providing the tool); legitimate interests (security, abuse prevention, improving the open-source project);
        consent where required (e.g. optional QA upload); legal obligation where applicable.
      </p>

      <h2>5. Where processing happens</h2>
      <p>
        Browser processing occurs on your device. Server-side processing (if enabled) occurs on infrastructure
        configured for the deployment you use. That may involve countries other than your own. Where required by law,
        appropriate safeguards (such as standard contractual clauses) should be implemented by the deployment operator.
      </p>

      <h2>6. Retention</h2>
      <ul>
        <li>
          <strong>QA worker (reference config):</strong> Font files are written to ephemeral temporary directories and
          deleted after the job completes.
        </li>
        <li>
          <strong>Server logs:</strong> Retained only as long as reasonably necessary for security and operations
          (typically rolling retention by the host — often 30–90 days unless law requires longer).
        </li>
        <li>
          <strong>Support communications:</strong> Retained as long as needed to handle your inquiry and for legal
          compliance.
        </li>
      </ul>

      <h2>7. Sharing and disclosure</h2>
      <p>We may share information only in these situations:</p>
      <ul>
        <li>
          <strong>Service providers</strong> (hosting, CDN, email) bound by confidentiality and processing terms, solely
          to operate the service;
        </li>
        <li>
          <strong>Legal requirements</strong> — if we believe disclosure is required by law, regulation, legal process, or
          governmental request;
        </li>
        <li>
          <strong>Protection of rights</strong> — to protect the Operator, users, or the public from fraud, abuse, or
          illegal activity;
        </li>
        <li>
          <strong>Business transfer</strong> — in connection with a merger, acquisition, or asset sale, subject to
          continued protection consistent with this policy.
        </li>
      </ul>
      <p>We do not sell personal information for money (including under CCPA/CPRA definitions of &quot;sell&quot;).</p>

      <h2>8. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, restrict, object to processing, data
        portability, and withdraw consent. You may also lodge a complaint with a supervisory authority (EEA/UK).
      </p>
      <p>
        Because most font processing is local, we often <strong>do not hold copies</strong> of your font files after a QA
        job ends. To exercise rights regarding data we do hold, contact{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may need to verify your request.
      </p>
      <p>
        <strong>California residents:</strong> You may have additional rights under CCPA/CPRA (know, delete, correct,
        opt-out of sale/share — we do not sell). We will not discriminate against you for exercising rights.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical and organizational measures appropriate to an open-source font utility (HTTPS,
        ephemeral QA storage, no intentional logging of font payloads). No method of transmission or storage is 100%
        secure. See <a href={GITHUB_URL}>security policy on GitHub</a> to report vulnerabilities.
      </p>

      <h2>10. Children</h2>
      <p>
        FontOps is not directed at children under 16. We do not knowingly collect personal information from children. If
        you believe a child has provided us data, contact us and we will take reasonable steps to delete it.
      </p>

      <h2>11. Third-party links and fonts</h2>
      <p>
        Loading fonts from external URLs (e.g. Google Fonts CSS) is governed by those third parties&apos; policies and
        your browser&apos;s requests to them. We do not control third-party sites linked from the UI (
        <a href={GITHUB_URL}>GitHub</a>, <a href={TWITTER_URL}>X</a>, etc.).
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Privacy Policy. The &quot;Last updated&quot; date will change. Material changes may be
        highlighted on the site. Continued use after the effective date constitutes acceptance where permitted by law.
      </p>

      <h2>13. Contact</h2>
      <p>
        Privacy questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        Website: <a href={CONTACT_URL}>{CONTACT_URL}</a>
        <br />
        Also see our <a href="/terms">Terms &amp; Conditions</a> and{" "}
        <a href="/legal-notice">Legal Notice</a>.
      </p>
    </article>
  );
}

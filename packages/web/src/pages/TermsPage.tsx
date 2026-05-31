import {
  CONTACT_EMAIL,
  CONTACT_URL,
  GITHUB_URL,
  LEGAL_LAST_UPDATED,
  OPERATOR_NAME,
  PRODUCT_NAME,
  PRODUCT_SLUG,
} from "../lib/legal-meta";

export default function TermsPage() {
  return (
    <article className="legal-page">
      <h1>Terms &amp; Conditions</h1>
      <p>
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of {PRODUCT_NAME} (the &quot;
        Service&quot;), including the {PRODUCT_SLUG} website, APIs, documentation, and related software operated by{" "}
        <strong>{OPERATOR_NAME}</strong> (&quot;Operator&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using
        the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>
      <p>
        Also read our <a href="/privacy">Privacy Policy</a> and <a href="/legal-notice">Legal Notice</a>. If you use the
        Service on behalf of an organization, you represent that you have authority to bind that organization.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 16 years old (or the age of digital consent in your country, if higher) and able to form a
        binding contract. The Service is not intended for children. You may not use the Service where prohibited by law
        (including export control or sanctions laws).
      </p>

      <h2>2. The Service</h2>
      <p>
        {PRODUCT_NAME} provides browser-based tools to inspect, subset, convert, and generate static instances of font
        files, plus optional server-side quality checks when you opt in. Features may change, be suspended, or be
        discontinued at any time without liability.
      </p>
      <p>
        <strong>Self-hosted and third-party deployments:</strong> Forks, mirrors, or enterprise installs may differ. The
        party operating that deployment is responsible for its configuration, logging, and compliance unless they
        expressly assume these Terms on behalf of the Operator.
      </p>

      <h2>3. No professional or legal advice</h2>
      <p>
        The Service does not provide legal, design, or licensing advice. License hints, QA results, and documentation are
        informational only. You are solely responsible for compliance with font licenses, platform rules, accessibility
        requirements, and applicable law.
      </p>

      <h2>4. Your content and font files</h2>
      <ul>
        <li>You retain ownership of fonts and content you submit, subject to third-party rights in those materials.</li>
        <li>
          You grant the Operator a limited, non-exclusive, royalty-free license to process your files <strong>only as
          necessary</strong> to provide the Service (including ephemeral QA processing when you opt in).
        </li>
        <li>
          You represent and warrant that you have all rights necessary to use, process, and (if applicable) distribute
          input and output files, and that your use does not infringe any third-party intellectual property, privacy, or
          other rights.
        </li>
        <li>
          You will not upload malware, unlawful content, or fonts you are not authorized to use. You will not use the
          Service to circumvent technical protection measures or license restrictions.
        </li>
      </ul>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate any applicable law or regulation;</li>
        <li>Infringe intellectual property or other rights;</li>
        <li>Probe, scan, or test vulnerabilities without authorization;</li>
        <li>Overload or disrupt the Service (including automated abuse of optional QA endpoints);</li>
        <li>Impersonate others or misrepresent affiliation with the Operator;</li>
        <li>Reverse engineer the Service except where expressly permitted by applicable law or open-source licenses.</li>
      </ul>
      <p>
        We may suspend or terminate access, remove content, or block IPs for violation of these Terms or to protect the
        Service, with or without notice where reasonable.
      </p>

      <h2>6. Open-source software</h2>
      <p>
        Components of {PRODUCT_NAME} are distributed under open-source licenses:
      </p>
      <ul>
        <li>
          <strong>MIT License</strong> — browser app and <code>@fontops/core</code> (see repository root{" "}
          <code>LICENSE</code>).
        </li>
        <li>
          <strong>GNU Affero General Public License v3.0</strong> — optional QA worker (see{" "}
          <code>apps/worker/LICENSE</code>).
        </li>
      </ul>
      <p>
        If there is a conflict between these Terms and an open-source license as to licensed source code, the open-source
        license governs that code. These Terms govern your use of the hosted Service as offered by the Operator.
      </p>
      <p>
        Third-party components are listed in <code>NOTICE.md</code> in the repository.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        THE SERVICE AND ALL OUTPUT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
        KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
        ERROR-FREE, SECURE, OR THAT OUTPUT FILES WILL BE VALID OR SUITABLE FOR PRODUCTION.
      </p>
      <p>
        Some jurisdictions do not allow disclaimer of implied warranties; in those jurisdictions, disclaimers apply to
        the maximum extent permitted.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE OPERATOR AND ITS CONTRIBUTORS, AFFILIATES, AND LICENSORS
        SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY
        LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS, ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE,
        EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE OPERATOR&apos;S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS
        IN ANY TWELVE (12) MONTH PERIOD SHALL NOT EXCEED THE GREATER OF (A) USD $100 OR (B) AMOUNTS YOU PAID US FOR THE
        SERVICE IN THAT PERIOD.
      </p>
      <p>
        Mandatory consumer rights in your country (including EEA, UK, Australia, and others) remain unaffected where they
        cannot be waived by contract.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You will defend, indemnify, and hold harmless the Operator and its contributors from any third-party claims,
        damages, losses, and expenses (including reasonable legal fees) arising from your use of the Service, your
        content or font files, or your breach of these Terms or applicable law.
      </p>

      <h2>10. Export and sanctions</h2>
      <p>
        You may not use or export the Service or technical data in violation of applicable export control or sanctions
        laws. You represent that you are not located in, or a national of, a country subject to comprehensive embargo or
        on applicable denied-party lists.
      </p>

      <h2>11. DMCA / copyright complaints (U.S.)</h2>
      <p>
        If you believe content on a deployment we operate infringes your copyright, send a notice to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with: identification of the work, identification of the
        material, your contact information, a good-faith statement, and your signature (physical or electronic). We may
        remove material and terminate repeat infringers where appropriate.
      </p>

      <h2>12. Dispute resolution and governing law</h2>
      <h3>12.1 Informal resolution</h3>
      <p>
        Before filing a formal dispute, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and allow
        at least 30 days to attempt informal resolution.
      </p>
      <h3>12.2 Governing law</h3>
      <p>
        These Terms are governed by the laws of the <strong>Republic of India</strong>, without regard to conflict-of-law
        rules that would apply another jurisdiction&apos;s laws.
      </p>
      <h3>12.3 Courts</h3>
      <p>
        Subject to Section 12.4, you and the Operator agree to the exclusive jurisdiction of the courts located in{" "}
        <strong>Bengaluru, Karnataka, India</strong> for disputes that are not subject to arbitration or that fall outside
        mandatory consumer forum rules in your country.
      </p>
      <h3>12.4 Arbitration (business users)</h3>
      <p>
        If you use the Service primarily for commercial purposes and your local law permits, disputes shall be resolved by
        binding arbitration in English in Bengaluru, India, under the Arbitration and Conciliation Act, 1996, by a single
        arbitrator. Either party may seek injunctive relief in court for intellectual property or unauthorized access.
        <strong> Consumers in the EEA, UK, or other jurisdictions with non-waivable forum rights may bring claims in their
        local courts as required by law.</strong>
      </p>
      <h3>12.5 Class actions</h3>
      <p>
        To the extent permitted by law, disputes must be brought individually and not as a plaintiff or class member in any
        class, consolidated, or representative proceeding.
      </p>

      <h2>13. Force majeure</h2>
      <p>
        We are not liable for failure or delay due to events beyond reasonable control (including outages, acts of God,
        war, labor disputes, or third-party service failures).
      </p>

      <h2>14. Changes</h2>
      <p>
        We may modify these Terms. The updated date will be revised. Material changes may be noted on the site. Your
        continued use after the effective date constitutes acceptance where permitted by law. If you do not agree, stop
        using the Service.
      </p>

      <h2>15. Severability and entire agreement</h2>
      <p>
        If any provision is unenforceable, the remainder stays in effect. These Terms, the Privacy Policy, and Legal
        Notice constitute the entire agreement regarding the hosted Service (excluding open-source license texts for
        source code).
      </p>

      <h2>16. Contact</h2>
      <p>
        {OPERATOR_NAME}
        <br />
        Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        Web: <a href={CONTACT_URL}>{CONTACT_URL}</a>
        <br />
        GitHub: <a href={GITHUB_URL}>{GITHUB_URL}</a>
      </p>
    </article>
  );
}

import {
  CONTACT_EMAIL,
  CONTACT_URL,
  GITHUB_URL,
  LEGAL_LAST_UPDATED,
  OPERATOR_NAME,
  PRODUCT_NAME,
} from "../lib/legal-meta";

export default function LegalNoticePage() {
  return (
    <article className="legal-page">
      <h1>Legal Notice &amp; Disclaimer</h1>
      <p>
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>

      <h2>Not legal advice</h2>
      <p>
        {PRODUCT_NAME}, its documentation, license hints, QA reports, and metadata displays are provided for
        informational and technical purposes only. They do <strong>not</strong> constitute legal, licensing, or
        professional advice. You should consult qualified counsel before relying on any output for commercial
        distribution, embedding, or compliance programs.
      </p>

      <h2>Operator</h2>
      <p>
        {PRODUCT_NAME} is operated by <strong>{OPERATOR_NAME}</strong>. Open-source source code is published at{" "}
        <a href={GITHUB_URL}>{GITHUB_URL}</a>. Contact: <a href={CONTACT_URL}>{CONTACT_URL}</a>,{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Font and intellectual property</h2>
      <ul>
        <li>
          <strong>You are solely responsible</strong> for ensuring you have the right to upload, subset, convert,
          instance, host, embed, or redistribute any font or output file.
        </li>
        <li>
          Subsetting, converting, or inspecting a font <strong>does not</strong> grant or imply any license from the
          Operator or from type foundries.
        </li>
        <li>
          License hints shown in the UI are extracted from font name tables and similar metadata. They may be incomplete,
          outdated, or wrong. They are <strong>not</strong> a substitute for reading the actual license agreement.
        </li>
        <li>
          Sample fonts bundled for demonstration remain subject to their respective licenses (see repository{" "}
          <code>NOTICE.md</code>).
        </li>
        <li>
          &quot;FontOps&quot; and related project branding do not imply endorsement by Google, Adobe, or any font vendor.
        </li>
      </ul>

      <h2>Software disclaimer</h2>
      <p>
        THE SOFTWARE AND SERVICE ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITHOUT WARRANTY OF ANY
        KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, OR THAT OUTPUT FILES WILL BE VALID, SUBSETTABLE, OR ACCEPTED BY
        BROWSERS, CDNs, OR APP STORES.
      </p>
      <p>
        Font subsetting and format conversion are technically complex. Output may be corrupted, incomplete, or rejected
        by validators (OTS, FontBakery, platform policies). <strong>You must validate</strong> output before production
        use.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE OPERATOR, CONTRIBUTORS, OR LICENSORS BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF
        PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS INTERRUPTION, ARISING FROM OR RELATED TO YOUR USE OF {PRODUCT_NAME},
        WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER THEORY, EVEN IF
        ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE OPERATOR&apos;S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS
        ARISING OUT OF OR RELATING TO THE SERVICE OR SOFTWARE IN ANY TWELVE (12) MONTH PERIOD SHALL NOT EXCEED THE
        GREATER OF (A) ONE HUNDRED U.S. DOLLARS (USD $100) OR (B) THE AMOUNT YOU PAID TO THE OPERATOR FOR THE SERVICE IN
        THAT PERIOD (TYPICALLY ZERO FOR FREE USE).
      </p>
      <p>
        Some jurisdictions do not allow certain limitations; in those jurisdictions, liability is limited to the fullest
        extent permitted by law. Nothing in these documents excludes liability that cannot be excluded (e.g. fraud,
        willful misconduct, or death/personal injury caused by negligence where exclusion is unlawful).
      </p>

      <h2>Your indemnity</h2>
      <p>
        You agree to defend, indemnify, and hold harmless the Operator and contributors from any claims, damages, losses,
        liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from: (a) your use of{" "}
        {PRODUCT_NAME}; (b) fonts or content you submit or produce; (c) your violation of these terms or applicable law;
        or (d) your violation of any third-party right, including intellectual property or privacy rights.
      </p>

      <h2>Open-source licenses</h2>
      <p>
        Browser and core packages are licensed under the <strong>MIT License</strong>. The optional QA worker is licensed
        under <strong>GNU AGPL v3</strong>. Using, modifying, or deploying those components is also governed by the
        respective license texts in the repository. If you offer network access to AGPL-covered worker code, you may have
        additional source-offer obligations.
      </p>

      <h2>No guarantee against legal claims</h2>
      <p>
        No website policy, software license, or disclaimer can guarantee that you or the Operator will never face a legal
        dispute in any country. These documents allocate risk and describe practices in good faith. For high-risk
        commercial use, obtain appropriate insurance and legal review.
      </p>

      <p>
        Binding terms: see <a href="/terms">Terms &amp; Conditions</a>. Privacy:{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </article>
  );
}

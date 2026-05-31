export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <h1>Privacy Policy</h1>
      <p>Last updated: May 31, 2026</p>
      <p>
        FontOps (&quot;we&quot;, &quot;the tool&quot;) is operated by Chaitanya Prabuddha. This policy explains how
        information is handled when you use the FontOps web application at subset-font-online and related pages.
      </p>
      <h2>Local processing by default</h2>
      <p>
        Inspect, subset, convert, instancing, and specimen preview run entirely in your browser. Font files you
        upload are not transmitted to our servers for those features unless you explicitly opt in to server-side QA.
      </p>
      <h2>Optional QA worker</h2>
      <p>
        If you enable server-side FontBakery QA, your font file is sent to the worker you configure (ours or your
        self-hosted instance) only for the duration of the QA job. Files are stored in ephemeral job directories and
        deleted after processing. We do not sell or share font data.
      </p>
      <h2>Logs</h2>
      <p>
        We do not log font binary contents. Server logs may contain request metadata (timestamps, status codes) without
        file payloads. Do not upload fonts you are not licensed to use.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        The open-source build does not include third-party advertising or analytics trackers. Hosting providers may
        collect standard HTTP logs.
      </p>
      <h2>Contact</h2>
      <p>
        Questions: <a href="https://www.chaitanyaprabuddha.com">chaitanyaprabuddha.com</a> or{" "}
        <a href="https://x.com/chayprabs">@chayprabs</a>.
      </p>
    </article>
  );
}

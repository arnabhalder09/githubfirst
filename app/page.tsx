export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 640 }}>
      <h1>LinkedIn Audience Tool</h1>
      <p>
        POST an <code>AudienceProfile</code> and a <code>topic</code> to{" "}
        <code>/api/linkedin/posts</code> to stream AI-drafted post copy tailored
        to that audience.
      </p>
    </main>
  );
}

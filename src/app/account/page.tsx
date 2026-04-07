import { currentUser } from '@clerk/nextjs/server';

export default async function AccountPage() {
  const user = await currentUser();

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px',
        background:
          'radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #111827 100%)',
        color: '#f8fafc',
      }}
    >
      <section
        style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: 760,
          border: '1px solid rgba(148,163,184,0.22)',
          background: 'rgba(15,23,42,0.72)',
          backdropFilter: 'blur(14px)',
          borderRadius: 28,
          padding: '32px',
          boxShadow: '0 30px 80px rgba(2,6,23,0.45)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            borderRadius: 999,
            padding: '8px 14px',
            background: 'rgba(59,130,246,0.14)',
            border: '1px solid rgba(96,165,250,0.28)',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#bfdbfe',
          }}
        >
          Authenticated account
        </div>

        <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.04em',
            }}
          >
            Welcome to CC.
          </h1>

          <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.6 }}>
            Clerk auth is live. This is the first protected account shell for the
            BlunderCheck restart.
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: '16px 18px',
              background: 'rgba(15,23,42,0.58)',
              border: '1px solid rgba(148,163,184,0.18)',
            }}
          >
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.12em' }}>
              User id
            </div>
            <div style={{ marginTop: 8, color: '#e2e8f0', fontSize: 14, wordBreak: 'break-all' }}>
              {user?.id ?? 'Unknown'}
            </div>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: '16px 18px',
              background: 'rgba(15,23,42,0.58)',
              border: '1px solid rgba(148,163,184,0.18)',
            }}
          >
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.12em' }}>
              Email
            </div>
            <div style={{ marginTop: 8, color: '#e2e8f0', fontSize: 14, wordBreak: 'break-word' }}>
              {user?.emailAddresses?.[0]?.emailAddress ?? 'Unknown'}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnimeEntrance } from "@/hooks/use-anime-entrance";
import { frontendEnv } from "@/lib/config";

type ProtectedSession = {
  sub: string;
  scope?: string;
  audience?: string | string[];
  message: string;
  routes: string[];
};

const protectedRoutes = [
  "/api/protected/session",
  "/api/mentor",
  "/api/neuro-data",
  "/api/audio-guide",
];

export default function App() {
  if (!frontendEnv.isConfigured) {
    return <ConfigurationScreen />;
  }

  return <PhaseOneShell />;
}

function PhaseOneShell() {
  const {
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();
  const [session, setSession] = useState<ProtectedSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isRequestingSession, setIsRequestingSession] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);

  async function loadProtectedSession() {
    setIsRequestingSession(true);
    setSessionError(null);

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: frontendEnv.auth0Audience,
        },
      });

      const response = await fetch(
        `${frontendEnv.apiBaseUrl}/api/protected/session`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const payload = (await response.json()) as
        | ProtectedSession
        | { error?: string };

      if (!response.ok) {
        const errorMessage = "error" in payload ? payload.error : undefined;
        throw new Error(errorMessage ?? "Secure session handshake failed.");
      }

      setSession(payload as ProtectedSession);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Unable to verify the protected backend session.",
      );
    } finally {
      setIsRequestingSession(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setSession(null);
      setSessionError(null);
      return;
    }

    void loadProtectedSession();
  }, [getAccessTokenSilently, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingScreen
          onOpenProtocol={() => setIsProtocolOpen(true)}
          onLogin={() => void loginWithRedirect()}
        />
        <ClinicalModal
          isOpen={isProtocolOpen}
          onClose={() => setIsProtocolOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <AuthenticatedScreen
        isRequestingSession={isRequestingSession}
        onLogout={() =>
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          })
        }
        onOpenProtocol={() => setIsProtocolOpen(true)}
        onRefreshSession={() => void loadProtectedSession()}
        session={session}
        sessionError={sessionError}
        userLabel={user?.name ?? user?.email ?? user?.nickname ?? "Authenticated clinician"}
      />
      <ClinicalModal
        isOpen={isProtocolOpen}
        onClose={() => setIsProtocolOpen(false)}
      />
    </>
  );
}

function ConfigurationScreen() {
  const entranceRef = useAnimeEntrance<HTMLDivElement>({
    variant: "panel",
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-mesh px-6 py-10 text-foreground">
      <div className="clinical-grid absolute inset-0 opacity-30" />
      <div
        ref={entranceRef}
        className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center"
      >
        <Card className="w-full border-red-400/20 bg-slate-950/70">
          <CardHeader data-entrance-item>
            <Badge variant="muted" className="w-fit">
              Configuration Required
            </Badge>
            <CardTitle>Auth0 client variables are missing</CardTitle>
            <CardDescription>
              Copy `.env.example` to `.env` at the project root and set the Auth0
              SPA values before starting the frontend.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div data-entrance-item className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Missing variables
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {frontendEnv.missing.map((entry) => (
                  <li
                    key={entry}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
                  >
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
            <div data-entrance-item className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Security boundary
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300/85">
                Frontend values stop at Auth0 public identifiers and the backend
                base URL. Snowflake, Gemini, ElevenLabs, MongoDB, and Solana
                secrets stay server-side in the root `.env`.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LoadingScreen() {
  const entranceRef = useAnimeEntrance<HTMLDivElement>({
    variant: "status",
    selector: "[data-loading-item]",
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-mesh px-6 py-10 text-foreground">
      <div className="clinical-grid absolute inset-0 opacity-30" />
      <div
        ref={entranceRef}
        className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center"
      >
        <Card className="w-full max-w-2xl bg-slate-950/70 text-center">
          <CardHeader data-loading-item>
            <Badge className="mx-auto w-fit">Auth0 Handshake</Badge>
            <CardTitle>Establishing simulator session</CardTitle>
          </CardHeader>
          <CardContent data-loading-item>
            <p className="text-sm leading-7 text-slate-300/85">
              Verifying the clinician identity before opening the simulator shell.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LandingScreen({
  onLogin,
  onOpenProtocol,
}: {
  onLogin: () => void;
  onOpenProtocol: () => void;
}) {
  const entranceRef = useAnimeEntrance<HTMLDivElement>({
    variant: "panel",
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-mesh px-6 py-10 text-foreground">
      <div className="clinical-grid absolute inset-0 opacity-30" />
      <div
        ref={entranceRef}
        className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 lg:grid-cols-[1.4fr_0.9fr]"
      >
        <section className="flex items-center">
          <Card className="w-full bg-slate-950/68">
            <CardHeader data-entrance-item>
              <Badge className="w-fit">Phase 1 Secure Access</Badge>
              <CardTitle className="max-w-3xl text-4xl leading-tight md:text-6xl">
                Clinical-grade access control for the neuro-simulation stack
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8">
                NeuroSim Web3 opens with Auth0-gated access, a protected Express
                API surface, and Anime.js driven clinical UI motion that will
                anchor the full simulator in later phases.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoBlock
                  icon="shield"
                  label="Access Layer"
                  text="Only authenticated users can reach the simulator shell or request protected AI routes."
                />
                <InfoBlock
                  icon="brain"
                  label="AI Boundary"
                  text="Snowflake, Gemma 4, and ElevenLabs stay behind the Node backend from the start."
                />
                <InfoBlock
                  icon="waves"
                  label="Motion System"
                  text="Anime.js handles sliding panels and modal fades with a reusable React hook."
                />
              </div>
              <div data-entrance-item className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={onLogin}>
                  Enter Simulator
                </Button>
                <Button size="lg" variant="outline" onClick={onOpenProtocol}>
                  View Protocol
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="flex items-center">
          <Card className="w-full bg-slate-950/50">
            <CardHeader data-entrance-item>
              <Badge variant="success" className="w-fit">
                Hardened Endpoints
              </Badge>
              <CardTitle className="text-3xl">Phase 1 route inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {protectedRoutes.map((route) => (
                <div
                  data-entrance-item
                  key={route}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    {route}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300/85">
                    Auth0 bearer token required before any agent workflow touches
                    user progress or AI orchestration.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function AuthenticatedScreen({
  isRequestingSession,
  onLogout,
  onOpenProtocol,
  onRefreshSession,
  session,
  sessionError,
  userLabel,
}: {
  isRequestingSession: boolean;
  onLogout: () => void;
  onOpenProtocol: () => void;
  onRefreshSession: () => void;
  session: ProtectedSession | null;
  sessionError: string | null;
  userLabel: string;
}) {
  const entranceRef = useAnimeEntrance<HTMLDivElement>({
    variant: "panel",
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-mesh px-6 py-10 text-foreground">
      <div className="clinical-grid absolute inset-0 opacity-30" />
      <div ref={entranceRef} className="relative mx-auto max-w-7xl space-y-8">
        <header className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="bg-slate-950/68">
            <CardHeader data-entrance-item>
              <Badge className="w-fit">Authenticated Session</Badge>
              <CardTitle className="text-4xl">Simulator shell unlocked</CardTitle>
              <CardDescription className="text-base leading-8">
                Phase 1 confirms the identity boundary before any AI mentor,
                progress tracker, or surgical subsystem is allowed to activate.
              </CardDescription>
            </CardHeader>
            <CardContent
              data-entrance-item
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" onClick={onRefreshSession} disabled={isRequestingSession}>
                {isRequestingSession ? "Refreshing Session" : "Refresh Session"}
              </Button>
              <Button size="lg" variant="outline" onClick={onOpenProtocol}>
                Security Protocol
              </Button>
              <Button size="lg" variant="secondary" onClick={onLogout}>
                Logout
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-950/50">
            <CardHeader data-entrance-item>
              <Badge variant="success" className="w-fit">
                Clinician Identity
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricRow icon="user" label="User" value={userLabel} />
              <MetricRow
                icon="shield"
                label="Backend Guard"
                value="Auth0 JWT verification active"
              />
              <MetricRow
                icon="bot"
                label="AI Endpoints"
                value="Protected placeholders ready for Phase 2"
              />
            </CardContent>
          </Card>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-slate-950/58">
            <CardHeader data-entrance-item>
              <Badge className="w-fit">Protected Handshake</Badge>
              <CardTitle className="text-3xl">Backend token verification</CardTitle>
              <CardDescription>
                The frontend requests a bearer token from Auth0 and uses it to
                call the secured Express route.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                data-entrance-item
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Status
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {sessionError
                    ? sessionError
                    : session?.message ?? "Waiting for protected session confirmation."}
                </p>
              </div>

              <div
                data-entrance-item
                className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-2"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    Subject
                  </p>
                  <p className="mt-3 break-all text-sm leading-7 text-slate-200">
                    {session?.sub ?? "Unavailable until the backend confirms the token."}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    Audience
                  </p>
                  <p className="mt-3 break-all text-sm leading-7 text-slate-200">
                    {Array.isArray(session?.audience)
                      ? session?.audience.join(", ")
                      : session?.audience ?? frontendEnv.auth0Audience}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950/50">
            <CardHeader data-entrance-item>
              <Badge variant="muted" className="w-fit">
                Locked Agent Surface
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {protectedRoutes.map((route) => (
                <div
                  data-entrance-item
                  key={route}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
                      {route}
                    </p>
                    <StatusGlyph kind="lock" className="h-4 w-4 text-cyan-200" />
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300/85">
                    Phase 1 keeps the route protected even before the sponsor
                    integrations are implemented.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function ClinicalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const modalRef = useAnimeEntrance<HTMLDivElement>({
    variant: "modal",
    enabled: isOpen,
    selector: "[data-modal-item]",
    delay: 80,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-6 py-8 backdrop-blur-md">
      <Card ref={modalRef} className="w-full max-w-2xl border-cyan-300/20 bg-slate-950/92">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div data-modal-item className="space-y-2">
            <Badge className="w-fit">Clinical Motion Protocol</Badge>
            <CardTitle className="text-3xl">Phase 1 architecture guardrails</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close protocol">
            <StatusGlyph kind="close" className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProtocolRow
            icon="shield"
            title="Auth0 first"
            description="The simulator shell is hidden until the user is authenticated and the API token is verified by Express."
          />
          <ProtocolRow
            icon="scan"
            title="Backend-only sponsor APIs"
            description="Snowflake, Gemma 4, ElevenLabs, MongoDB, and Solana credentials remain server-side in the root environment file."
          />
          <ProtocolRow
            icon="activity"
            title="Anime.js entrance system"
            description="Sliding panels and modal fades are driven by a reusable hook so later 3D and surgical flows can share one motion language."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: GlyphKind;
  label: string;
  value: string;
}) {
  return (
    <div
      data-entrance-item
      className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-4"
    >
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
        <StatusGlyph kind={Icon} className="h-5 w-5 text-cyan-100" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  text,
}: {
  icon: GlyphKind;
  label: string;
  text: string;
}) {
  return (
    <div
      data-entrance-item
      className="rounded-[24px] border border-white/10 bg-white/5 p-5"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
          <StatusGlyph kind={Icon} className="h-5 w-5 text-cyan-100" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
          {label}
        </p>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300/85">{text}</p>
    </div>
  );
}

function ProtocolRow({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: GlyphKind;
  title: string;
}) {
  return (
    <div
      data-modal-item
      className="rounded-3xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
          <StatusGlyph kind={Icon} className="h-5 w-5 text-cyan-100" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
          {title}
        </p>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300/85">{description}</p>
    </div>
  );
}

type GlyphKind =
  | "activity"
  | "bot"
  | "brain"
  | "close"
  | "lock"
  | "scan"
  | "shield"
  | "user"
  | "waves";

function StatusGlyph({
  className,
  kind,
}: {
  className?: string;
  kind: GlyphKind;
}) {
  const sharedProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  const paths: Record<GlyphKind, JSX.Element> = {
    activity: (
      <path d="M3 12h4l2.5-5 4.5 10 2.5-5H21" />
    ),
    bot: (
      <>
        <rect x="5" y="7" width="14" height="10" rx="3" />
        <path d="M12 4v3M9 12h.01M15 12h.01M8 18v2M16 18v2" />
      </>
    ),
    brain: (
      <>
        <path d="M10 5a3 3 0 0 0-5 2.2A3.2 3.2 0 0 0 4 12a3 3 0 0 0 3 5h3" />
        <path d="M14 5a3 3 0 0 1 5 2.2A3.2 3.2 0 0 1 20 12a3 3 0 0 1-3 5h-3" />
        <path d="M12 5v14M8.5 9.5H12M12 14.5h3.5" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </>
    ),
    scan: (
      <>
        <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M3 17v2a2 2 0 0 0 2 2h2M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 12h10" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.2-2.7 8-7 10-4.3-2-7-5.8-7-10V6l7-3Z" />
        <path d="M9.5 12l1.7 1.7L15 10" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    waves: (
      <>
        <path d="M4 12c2.2-2 4.2-2 6.4 0s4.2 2 6.4 0 4.2-2 3.2 0" />
        <path d="M4 16c2.2-2 4.2-2 6.4 0s4.2 2 6.4 0 4.2-2 3.2 0" />
        <path d="M4 8c2.2-2 4.2-2 6.4 0s4.2 2 6.4 0 4.2-2 3.2 0" />
      </>
    ),
  };

  return <svg {...sharedProps}>{paths[kind]}</svg>;
}

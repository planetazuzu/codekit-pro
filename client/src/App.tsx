import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import NotFound from "@/pages/not-found";
import { PWAInstallPrompt } from "@/components/mobile";

// Lazy load pages - Main pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Prompts = lazy(() => import("@/pages/Prompts"));
const Tools = lazy(() => import("@/pages/Tools"));
const Links = lazy(() => import("@/pages/Links"));
const Snippets = lazy(() => import("@/pages/Snippets"));
const Guides = lazy(() => import("@/pages/Guides"));
const APIGuides = lazy(() => import("@/pages/APIGuides"));
const Admin = lazy(() => import("@/pages/Admin"));
const Resources = lazy(() => import("@/pages/Resources"));
const AffiliateLanding = lazy(() => import("@/pages/AffiliateLanding"));
const AdminAffiliates = lazy(() => import("@/pages/AdminAffiliates"));
const AffiliateProgramsTracker = lazy(() => import("@/pages/AffiliateProgramsTracker"));
const AffiliateProgramsDashboard = lazy(() => import("@/pages/AffiliateProgramsDashboard"));
const Deals = lazy(() => import("@/pages/Deals"));
const Legal = lazy(() => import("@/pages/Legal"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Docs = lazy(() => import("@/pages/Docs"));

// Lazy load tools - Heavy components
const ReadmeGenerator = lazy(() => import("@/tools/ReadmeGenerator"));
const MetaGenerator = lazy(() => import("@/tools/MetaGenerator"));
const FolderGenerator = lazy(() => import("@/tools/FolderGenerator"));
const JSONSchemaGenerator = lazy(() => import("@/tools/JSONSchemaGenerator"));
const Base64Converter = lazy(() => import("@/tools/Base64Converter"));
const ColorGenerator = lazy(() => import("@/tools/ColorGenerator"));
const SVGGenerator = lazy(() => import("@/tools/SVGGenerator"));
const FaviconGenerator = lazy(() => import("@/tools/FaviconGenerator"));
const MockupGenerator = lazy(() => import("@/tools/MockupGenerator"));
const LicenseGenerator = lazy(() => import("@/tools/LicenseGenerator"));
const GitIgnoreGenerator = lazy(() => import("@/tools/GitIgnoreGenerator"));
const JSONFormatter = lazy(() => import("@/tools/JSONFormatter"));
const YAMLFormatter = lazy(() => import("@/tools/YAMLFormatter"));
const RegexTester = lazy(() => import("@/tools/RegexTester"));
const UUIDGenerator = lazy(() => import("@/tools/UUIDGenerator"));
const JWTDecoder = lazy(() => import("@/tools/JWTDecoder"));
const JSONToTypeScript = lazy(() => import("@/tools/JSONToTypeScript"));
const APITester = lazy(() => import("@/tools/APITester"));
const DatabaseModelGenerator = lazy(() => import("@/tools/DatabaseModelGenerator"));
const SmartPromptGenerator = lazy(() => import("@/tools/SmartPromptGenerator"));
const CodeRewriter = lazy(() => import("@/tools/CodeRewriter"));
const FunctionGenerator = lazy(() => import("@/tools/FunctionGenerator"));
const ErrorExplainer = lazy(() => import("@/tools/ErrorExplainer"));
const TestGenerator = lazy(() => import("@/tools/TestGenerator"));
const AutoDocumentation = lazy(() => import("@/tools/AutoDocumentation"));
const UsageExamplesGenerator = lazy(() => import("@/tools/UsageExamplesGenerator"));

// Wrapper component for Suspense with Error Boundary
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              No se pudo cargar este componente. Por favor, recarga la página.
            </p>
          </div>
        </div>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <SuspenseWrapper>
          <Dashboard />
        </SuspenseWrapper>
      </Route>
      <Route path="/prompts">
        <SuspenseWrapper>
          <Prompts />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools">
        <SuspenseWrapper>
          <Tools />
        </SuspenseWrapper>
      </Route>
      <Route path="/links">
        <SuspenseWrapper>
          <Links />
        </SuspenseWrapper>
      </Route>
      <Route path="/snippets">
        <SuspenseWrapper>
          <Snippets />
        </SuspenseWrapper>
      </Route>
      <Route path="/guides">
        <SuspenseWrapper>
          <Guides />
        </SuspenseWrapper>
      </Route>
      <Route path="/api-guides">
        <SuspenseWrapper>
          <APIGuides />
        </SuspenseWrapper>
      </Route>
      <Route path="/resources">
        <SuspenseWrapper>
          <Resources />
        </SuspenseWrapper>
      </Route>
      <Route path="/docs">
        <SuspenseWrapper>
          <Docs />
        </SuspenseWrapper>
      </Route>
      <Route path="/docs/:path*">
        <SuspenseWrapper>
          <Docs />
        </SuspenseWrapper>
      </Route>
      <Route path="/deals">
        <SuspenseWrapper>
          <Deals />
        </SuspenseWrapper>
      </Route>
      <Route path="/legal">
        <SuspenseWrapper>
          <Legal />
        </SuspenseWrapper>
      </Route>
      <Route path="/privacy">
        <SuspenseWrapper>
          <Privacy />
        </SuspenseWrapper>
      </Route>
      <Route path="/admin">
        <SuspenseWrapper>
          <Admin />
        </SuspenseWrapper>
      </Route>
      <Route path="/admin/affiliates">
        <SuspenseWrapper>
          <AdminAffiliates />
        </SuspenseWrapper>
      </Route>
      <Route path="/admin/affiliates-tracker">
        <SuspenseWrapper>
          <AffiliateProgramsTracker />
        </SuspenseWrapper>
      </Route>
      <Route path="/admin/affiliates-dashboard">
        <SuspenseWrapper>
          <AffiliateProgramsDashboard />
        </SuspenseWrapper>
      </Route>

      {/* Tools Routes */}
      <Route path="/tools/readme">
        <SuspenseWrapper>
          <ReadmeGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/meta">
        <SuspenseWrapper>
          <MetaGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/folders">
        <SuspenseWrapper>
          <FolderGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/json">
        <SuspenseWrapper>
          <JSONSchemaGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/base64">
        <SuspenseWrapper>
          <Base64Converter />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/colors">
        <SuspenseWrapper>
          <ColorGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/svg">
        <SuspenseWrapper>
          <SVGGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/favicon">
        <SuspenseWrapper>
          <FaviconGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/mockup">
        <SuspenseWrapper>
          <MockupGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/license">
        <SuspenseWrapper>
          <LicenseGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/gitignore">
        <SuspenseWrapper>
          <GitIgnoreGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/json-formatter">
        <SuspenseWrapper>
          <JSONFormatter />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/yaml-formatter">
        <SuspenseWrapper>
          <YAMLFormatter />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/regex">
        <SuspenseWrapper>
          <RegexTester />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/uuid">
        <SuspenseWrapper>
          <UUIDGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/jwt">
        <SuspenseWrapper>
          <JWTDecoder />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/json-to-ts">
        <SuspenseWrapper>
          <JSONToTypeScript />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/api-tester">
        <SuspenseWrapper>
          <APITester />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/db-models">
        <SuspenseWrapper>
          <DatabaseModelGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/smart-prompts">
        <SuspenseWrapper>
          <SmartPromptGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/code-rewriter">
        <SuspenseWrapper>
          <CodeRewriter />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/function-generator">
        <SuspenseWrapper>
          <FunctionGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/error-explainer">
        <SuspenseWrapper>
          <ErrorExplainer />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/test-generator">
        <SuspenseWrapper>
          <TestGenerator />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/auto-docs">
        <SuspenseWrapper>
          <AutoDocumentation />
        </SuspenseWrapper>
      </Route>
      <Route path="/tools/usage-examples">
        <SuspenseWrapper>
          <UsageExamplesGenerator />
        </SuspenseWrapper>
      </Route>
      
      {/* Affiliate Landing Pages */}
      <Route path="/tools/:slug">
        <SuspenseWrapper>
          <AffiliateLanding />
        </SuspenseWrapper>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

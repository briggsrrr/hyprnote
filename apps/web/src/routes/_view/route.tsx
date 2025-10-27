import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_view")({
  component: Component,
  loader: async ({ context }) => ({ user: context.user }),
});

function Component() {
  return (
    <div>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-neutral-100 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-0 py-3 border-x border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-semibold text-2xl font-serif hover:scale-105 transition-transform"
            >
              Hyprnote
            </Link>
            <a
              href="https://docs.hyprnote.com"
              className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Docs
            </a>
            <Link
              to="/blog"
              className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/pricing"
              className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Pricing
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <div className="flex gap-3">
              <HeaderUser />
              <Link
                to="/downloads"
                className="px-4 h-8 flex items-center text-sm bg-linear-to-t from-stone-600 to-stone-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-[102%] active:scale-[98%] transition-all"
              >
                Download
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeaderUser() {
  const { user } = Route.useLoaderData();

  if (user) {
    return (
      <Link
        to="/app/account"
        className="px-3 h-8 flex items-center text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        Account
      </Link>
    );
  }

  return (
    <Link
      to="/auth"
      search={{ flow: "web" }}
      className="px-3 h-8 flex items-center text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
    >
      Get Started
    </Link>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-0 py-6 border-x border-neutral-100">
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <p>© {currentYear} Fastrepl, Inc.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-neutral-800 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-neutral-800 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

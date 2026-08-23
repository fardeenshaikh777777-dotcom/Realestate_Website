import React from "react";
import { useRoute, useScrollToTop } from "./router";
import { Navbar, Footer } from "./components/layout";
import { ToastHost } from "./components/ui";
import { HomePage } from "./pages/Home";
import { ListingsPage } from "./pages/Listings";
import { PropertyDetailPage } from "./pages/PropertyDetail";
import { AuthPage } from "./pages/Auth";
import { UserDashboardPage } from "./pages/UserDashboard";
import { AgentDashboardPage } from "./pages/AgentDashboard";
import { AdminDashboardPage } from "./pages/AdminDashboard";
import { AboutPage, ContactPage, LegalPage, NotFoundPage } from "./pages/Static";

export default function App() {
  const route = useRoute();
  useScrollToTop(route.parts.join("/") || "home");

  const page = route.parts[0] ?? "";
  const isAuth = page === "auth";

  let content: React.ReactNode;
  switch (page) {
    case "": content = <HomePage />; break;
    case "listings": content = <ListingsPage />; break;
    case "property": content = <PropertyDetailPage key={route.parts[1]} />; break;
    case "auth": content = <AuthPage />; break;
    case "dashboard": content = <UserDashboardPage />; break;
    case "agent": content = <AgentDashboardPage />; break;
    case "admin": content = <AdminDashboardPage />; break;
    case "about": content = <AboutPage />; break;
    case "contact": content = <ContactPage />; break;
    case "legal": content = <LegalPage slug={route.parts[1] ?? "privacy"} />; break;
    default: content = <NotFoundPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuth && <Navbar />}
      <div className="flex-1">{content}</div>
      {!isAuth && <Footer />}
      <ToastHost />
    </div>
  );
}

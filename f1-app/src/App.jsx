import { lazy, Suspense } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import Nav from "./components/nav/Nav";
import Footer from "./components/footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const InfoDriver = lazy(() => import("./components/infoDriver/Infodriver"));
const Races = lazy(() => import("./pages/Races"));
const Standings = lazy(() => import("./pages/Standings"));
const News = lazy(() => import("./pages/News"));
const Admin = lazy(() => import("./pages/Admin"));
const F1LightsOut = lazy(() => import("./pages/Lightout"));
const DreamTeam = lazy(() => import("./pages/DreamTeam"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoading() {
  return <div className="routeLoading" role="status">Loading page…</div>;
}

export default function App() {
  const location = useLocation();
  const routes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/drivers", element: <InfoDriver /> },
    { path: "/races", element: <Races /> },
    { path: "/standings", element: <Standings /> },
    { path: "/news", element: <News /> },
    { path: "/admin", element: <Admin /> },
    { path: "/light", element: <F1LightsOut /> },
    { path: "/team", element: <DreamTeam /> },
    { path: "*", element: <NotFound /> },
  ]);

  return (
    <div className="App">
      <Nav />
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<RouteLoading />}>{routes}</Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

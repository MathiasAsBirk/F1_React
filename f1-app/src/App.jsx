import { useRoutes } from "react-router-dom";
import Nav from "./components/nav/Nav";
import Footer from "./components/footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

import Home from "./pages/Home";
import InfoDriver from "./components/infoDriver/Infodriver";
import Races from "./pages/Races";
import Standings from "./pages/Standings";
import News from "./pages/News";
import Admin from "./pages/Admin";
import F1LightsOut from "./pages/Lightout";
import DreamTeam from "./pages/DreamTeam";

export default function App() {
  const routes = useRoutes([
    { path: "/",          element: <Home />        },
    { path: "/drivers",   element: <InfoDriver />  },
    { path: "/races",     element: <Races />       },
    { path: "/standings", element: <Standings />   },
    { path: "/news",      element: <News />        },
    { path: "/admin",     element: <Admin />       },
    { path: "/light",     element: <F1LightsOut /> },
    { path: "/team",      element: <DreamTeam />   },  // fixed: was missing leading slash
  ]);

  return (
    <div className="App">
      <Nav />
      <ErrorBoundary>{routes}</ErrorBoundary>
      <Footer />
    </div>
  );
}

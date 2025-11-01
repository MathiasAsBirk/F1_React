import { useRoutes } from "react-router-dom";
import { useState } from "react";
import Nav from './components/nav/Nav'
import Home from './pages/Home';
import Drivers from "./pages/Drivers";
import Races from "./pages/Races";
import Standings from "./pages/Standings";
import News from "./pages/News";
import Footer from "./components/footer/Footer";
import Admin from './pages/Admin';
import F1LightsOut from "./pages/Lightout";
import DreamTeam from "./pages/DreamTeam";





export default function App() {
  const routes = useRoutes([
    {path: '/', element: <Home /> },
    {path: '/drivers', element: <Drivers /> },
    {path : '/races', element: <Races />},
    {path: '/standings', element: <Standings />},
    {path: '/news', element: <News />},
    {path: '/admin', element: <Admin /> },
    {path: '/light', element: <F1LightsOut/> },
    {path: 'team', element: <DreamTeam/>}
  ])

  return (
    <div className="App">
      <Nav />
      {routes}
      <Footer />
    </div>
  )
}


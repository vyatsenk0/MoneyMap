import * as React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Container, Flex, MantineProvider, createTheme } from "@mantine/core"; // Import MantineProvider
import { Notifications } from '@mantine/notifications';
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import "katex/dist/katex.min.css";


// Supports weights 100-900
import '@fontsource-variable/montserrat';

import LeftSidebar from "./components/LeftSideBar.jsx"; // Import the LeftSidebar component
import HomePage from "./pages/HomePage.jsx";
import FinancialGoal from "./pages/FinancialGoal.jsx";
import FinancialGoalsDashboard from "./pages/FinancialGoalsDashboard.jsx";
import FinancialGoalsPage from "./pages/FinancialGoalsPage.jsx";
import LogTransactions from "./pages/LogTransactions.jsx";
import TrackBudget from "./pages/TrackBudget.jsx"; // Import TrackBudget
import Settings from "./pages/Settings.jsx"; // Import Settings
import Chat from "./pages/Chat.jsx";

const theme = createTheme({
  primaryColor: "green",
  fontFamily: "Montserrat Variable",
});

function App() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <Notifications position="top-right" />
      <HashRouter>
        <Flex mih="100vh" bg="linear-gradient(180deg, var(--mantine-color-green-9), var(--mantine-color-green-6))">
          {/* Sidebar */}
          <LeftSidebar />

          {/* Main Content */}
          <Container fluid flex={1} p="xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/log-transactions" element={<LogTransactions />} />
              <Route path="/financial-goal" element={<FinancialGoal />} />
              <Route path="/financial-goals-dashboard" element={<FinancialGoalsDashboard />} />
              <Route path="/financial-goals-page" element={<FinancialGoalsPage />} />
              <Route path="/track-budget" element={<TrackBudget />} /> {/* Add the new route here */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </Container>
        </Flex>
      </HashRouter>
    </MantineProvider>
  );
}

// Ensure there's a root div in your HTML (index.html)
const rootElement = document.getElementById("root");
if (!rootElement) {
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
  createRoot(newRoot).render(<App />);
} else {
  createRoot(rootElement).render(<App />);
}

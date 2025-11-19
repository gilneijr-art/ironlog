import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Routines from "./pages/Routines";
import Exercises from "./pages/Exercises";
import Profile from "./pages/Profile";
import ActiveWorkout from "./pages/ActiveWorkout";
import History from "./pages/History";
import ExerciseStats from "./pages/ExerciseStats";
import BottomNav from "./components/BottomNav";

function Router() {
  return (
    <div className="pb-16">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/routines" component={Routines} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/profile" component={Profile} />
        <Route path="/workout/:id" component={ActiveWorkout} />
        <Route path="/history" component={History} />
        <Route path="/exercise/:id" component={ExerciseStats} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

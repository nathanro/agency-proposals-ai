import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import HomePage from '@/app/page';
import LoginPage from '@/app/auth/login/page';
import DashboardPage from '@/app/dashboard/page';
import NewProposalPage from '@/app/proposals/new/page';
import TemplatesPage from '@/app/templates/page';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/proposals/new" component={NewProposalPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

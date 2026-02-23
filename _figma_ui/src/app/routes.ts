import { createBrowserRouter } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { MissionControl } from './pages/MissionControl';
import { Accounts } from './pages/Accounts';
import { Inbox } from './pages/Inbox';
import { Tasks } from './pages/Tasks';
import { Login } from './pages/Login';
import { VideoOutreach } from './pages/VideoOutreach';
import { CreateVideo } from './pages/CreateVideo';
import { VideoDetail } from './pages/VideoDetail';
import { VideoLanding } from './pages/VideoLanding';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: MissionControl },
      { path: 'accounts', Component: Accounts },
      { path: 'inbox', Component: Inbox },
      { path: 'tasks', Component: Tasks },
      { path: 'videos', Component: VideoOutreach },
      { path: 'videos/create', Component: CreateVideo },
      { path: 'videos/landing-preview', Component: VideoLanding },
      { path: 'videos/landing-preview/:id', Component: VideoLanding },
      { path: 'videos/:id', Component: VideoDetail },
      { path: 'settings', Component: Settings },
    ],
  },
]);

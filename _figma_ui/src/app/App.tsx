import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
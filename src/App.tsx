import { AppLayout } from './components/AppLayout';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <div className="App" dir="ltr">
          <AppLayout />
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
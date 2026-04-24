import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LetterScreen } from './screens/LetterScreen';
import { ChatScreen } from './screens/ChatScreen';
import { EmailScreen } from './screens/EmailScreen';

function AppRouter() {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'questionnaire':
      return <QuestionnaireScreen />;
    case 'processing':
      return <ProcessingScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    case 'letter':
      return <LetterScreen />;
    case 'chat':
      return <ChatScreen />;
    case 'email':
      return <EmailScreen />;
    default:
      return <WelcomeScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Survey } from './pages/Survey';
import { Results } from './pages/Results';
import { Admin } from './pages/Admin';
import { SurveyProvider } from './context/SurveyContext';

export default function App() {
  return (
    <SurveyProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </SurveyProvider>
  );
}

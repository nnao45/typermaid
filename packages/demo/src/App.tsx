import { useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Gallery } from './pages/Gallery';
import { Playground } from './pages/Playground';
import './index.css';

function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Router>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header onThemeToggle={toggleTheme} isDark={isDark} />

          <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="py-4 px-1 border-b-2 border-transparent hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Playground
                </Link>
                <Link
                  to="/gallery"
                  className="py-4 px-1 border-b-2 border-transparent hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Gallery
                </Link>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Playground />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

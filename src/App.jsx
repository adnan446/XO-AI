// App.jsx or main.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Multiplayer from './Multyplayer';
import Withai from './Withai';
import TicTacToe from './TicTacToe';
import ShootingGame from './ShootingGame';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/multiplayer" element={<Multiplayer />} />
        <Route path="/withai" element={<Withai />} />
        <Route path="/sketch" element={<TicTacToe />} />
        {!isMobile && <Route path="/shooter" element={<ShootingGame />} />}

      </Routes>
    </Router>
  );
}

export default App;
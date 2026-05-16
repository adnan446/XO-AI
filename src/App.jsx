import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import MultiLobby from './MultiLobby';
import MultiGame from './MultiGame';
import Withai from './Withai';
import TicTacToe from './TicTacToe';
import ShootingGame from './ShootingGame';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Multiplayer: lobby + game room */}
        <Route path="/multiplayer" element={<MultiLobby />} />
        <Route path="/multi/:roomId" element={<MultiGame />} />
        {/* Other modes — untouched */}
        <Route path="/withai" element={<Withai />} />
        <Route path="/sketch" element={<TicTacToe />} />
        {!isMobile && <Route path="/shooter" element={<ShootingGame />} />}
      </Routes>
    </Router>
  );
}

export default App;
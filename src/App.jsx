// App.jsx or main.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Multiplayer from './Multyplayer';
import Withai from './Withai';
import TicTacToe from './TicTacToe';
import ShootingGame from './ShootingGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/multiplayer" element={<Multiplayer />} />
        <Route path="/withai" element={<Withai />} />
        <Route path="/sketch" element={<TicTacToe />} />
        <Route path="/shooter" element={<ShootingGame />} />

      </Routes>
    </Router>
  );
}

export default App;
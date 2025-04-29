import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Counter from './components/Counter/Counter';
import KickChatOverlay from './components/KickChat/KickChatOverlay';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Counter />} />
        <Route path="/kickchat" element={<KickChatOverlay />} />
      </Routes>
    </Router>
  );
}

export default App;
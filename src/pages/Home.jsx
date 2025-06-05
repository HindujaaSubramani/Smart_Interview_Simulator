// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Smart Interview Simulator</h1>
      <p>Choose your experience below:</p>
      <div className="home-buttons">
        <button onClick={() => navigate('/interview')}>🎤 Start SDE Interview</button>
        <button onClick={() => navigate('/learn')}>📘 Learn How to Face Interviews</button>
      </div>
    </div>
  );
};

export default Home;

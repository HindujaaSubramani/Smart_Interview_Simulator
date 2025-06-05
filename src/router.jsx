// src/router.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import LearnToFace from './pages/LearnToFace'; // 🆕 Import the new page

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/interview',
    element: <Interview />,
  },
  {
    path: '/learn',
    element: <LearnToFace />, // 🆕 Add this route
  },
]);

export default router;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';

const App: React.FC = () => {
  return (
    <>
    <main>
      <SignIn/>
    </main>
    </>
  );
};

export default App;
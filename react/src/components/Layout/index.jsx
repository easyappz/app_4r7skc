import React from 'react';
import { Header } from '../Header';
import './Layout.css';

export const Layout = ({ children }) => {
  return (
    <div className="layout" data-easytag="id3-src/components/Layout/index.jsx">
      <Header />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

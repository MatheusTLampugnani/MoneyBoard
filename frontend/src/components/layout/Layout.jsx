import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="d-flex bg-light min-vh-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex-grow-1 main-content">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <main className="p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
// // src/components/Layout/DefaultLayout.jsx
import React from 'react';
import Sidebar from '../../pages/Admin/components/Sidebar';

const DefaultLayout = ({ children }) => {
   return (
      <div className="d-flex">
         <Sidebar />
         <div className="flex-grow-1 p-4" style={{ background: "#f9f9f9", minHeight: "100vh" }}>
            {children}
         </div>
      </div>
   );
};

export default DefaultLayout;

import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Routers from "../../router/Routers";
import Footer from "../Footer/Footer";
import ScrollUpButton from "../Scrollup/Scrollup";

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/home" || location.pathname === "/";

  return (
    <>
      {!isHomePage && <Header />} {/* Only render Header if not on /home */}
      <Routers />
      <Footer />
      <ScrollUpButton />
    </>
  );
};

export default Layout;

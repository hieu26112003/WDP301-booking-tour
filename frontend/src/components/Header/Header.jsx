import React, { useEffect, useRef, useContext } from 'react';
import { Container, Row, Button } from 'reactstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.png';
import './header.css';
import { AuthContext } from '../../context/AuthContext';
import Dropdown from 'react-bootstrap/Dropdown';

const nav__links = [
   {
      path: '/home',
      display: 'Home',
   }, 
   {
      path: '/tours',
      display: 'Tours'
   },
   {
      path: '/about',

      display: 'About',
   },
   {
      path: '/deals',
      display: 'Promotion',
   },{
      path: '/contact',
      display: 'Contact',
   }
];


const Header = () => {
   const headerRef = useRef(null);
   const menuRef = useRef(null);
   const navigate = useNavigate();
   const { user, dispatch } = useContext(AuthContext);

   const logout = () => {
      dispatch({ type: 'LOGOUT' });
      navigate('/');
   };

   const stickyHeaderFunc = () => {
      window.addEventListener('scroll', () => {
         if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
            headerRef.current.classList.add('sticky__header');
         } else {
            headerRef.current.classList.remove('sticky__header');
         }
      });
   };

   useEffect(() => {
      stickyHeaderFunc();

      return () => {
         window.removeEventListener('scroll', stickyHeaderFunc);
      };
   }, []);

   const toggleMenu = () => menuRef.current.classList.toggle('show__menu');

   return (
      <header className='header' ref={headerRef}>
         <Container>
            <Row>
               <div className='nav__wrapper d-flex align-items-center justify-content-between'>
                  {/* ========== LOGO ========== */}
                  <div className='logo'>
                     {/* Make the logo a button that navigates to the home page */}
                     <Link to='/home'>
                        <img src={Logo} alt='Logo' />
                     </Link>
                  </div>

                  {/* ========================== */}

                  {/* ========== MENU START ========== */}

                  <div className='navigation' ref={menuRef} onClick={toggleMenu}>
                     <ul className='menu d-flex align-items-center gap-5'>
                        {nav__links.map((item, index) => (
                           <li className='nav__item' key={index}>
                              <NavLink
                                 to={item.path}
                                 className={(navClass) =>
                                    navClass.isActive ? 'active__link' : ''
                                 }
                              >
                                 {item.display}
                              </NavLink>
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* ================================ */}

                  <div className='nav__right d-flex align-items-center gap-5'>
                     <div className='nav__btns d-flex align-items-center gap-2'>
                        {user ? (
                           <>
                              <Dropdown>
                                 <Dropdown.Toggle
                                    id='dropdown-button-dark-example1'
                                    variant='secondary'
                                 >
                                    {user.username}
                                 </Dropdown.Toggle>

                                 <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to='/profile'>
                                       Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to='/my-booking'>
                                       MyBooking
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                                 </Dropdown.Menu>
                              </Dropdown>
                           </>
                        ) : (
                           <>
                              <Button className='btn primary__btn'>
                                 <Link to='/login' className='link-btn'>
                                    Login
                                 </Link>
                              </Button>
                              <Button className='btn primary__btn'>
                                 <Link to='/register' className='link-btn'>
                                    Register
                                 </Link>
                              </Button>
                           </>
                        )}
                     </div>
                     <span className='mobile__menu' onClick={toggleMenu}>
                        <i className='ri-menu-line'></i>
                     </span>
                  </div>
               </div>
            </Row>
         </Container>
      </header>
   );
};

export default Header;

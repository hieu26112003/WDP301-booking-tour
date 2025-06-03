import React, { useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import './Scrollup.css'; // Import your CSS file for styling

const ScrollUpButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Optional smooth scrolling animation
    });
  };

  // Function to handle scrolling and show/hide the button based on scroll position
  const handleScroll = () => {
    const scrollTop = window.pageYOffset;
    if (scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Add scroll event listener when component mounts
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`scroll-up-button ${isVisible ? 'show' : 'hide'}`} onClick={scrollToTop}>
      <FaArrowUp />
    </div>
  );
};

export default ScrollUpButton;

import React from 'react';
import Navbar from '../components/navbar/navbar'; 
import Hero from '../components/hero/hero'; 
import Chatbot from '../components/Chatbot/ChatbotComponent';
import Menu from '../components/menu/menu';
import Footer from '../components/footer/footer';

const HomePage = () => {
  return (
    <div>
      <Navbar />  
      <Hero />
      <Menu />
      <Chatbot />
      <Footer />
    </div>
  );
}

export default HomePage;
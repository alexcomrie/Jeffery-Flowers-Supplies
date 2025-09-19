import React from 'react';
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <SEOHead
        title="Jeffery Flowers Supplies - Bringing plants to plant lovers"
        description="Discover local businesses and products in Jamaica"
        keywords="jamaica,Jeffery Flowers, local business, plants, services"
      />
      <main className="main-content">
        <h1>Welcome to TheHub JA</h1>
        <p>Your one-stop marketplace for local businesses in Jamaica</p>
      </main>
    </div>
  );
};

export default Home;
// Shared JavaScript functionality
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
          });
      });
  });

  // Pricing card hover effect
  const pricingCards = document.querySelectorAll('.hover\\:scale-105');
  pricingCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
          if (card.classList.contains('transform')) return;
          card.classList.add('hover-float');
      });
      card.addEventListener('mouseleave', () => {
          card.classList.remove('hover-float');
      });
  });
});

const toggle = document.getElementById('darkToggle');

toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark'); // toggle dark class
    if (document.documentElement.classList.contains('dark')) {
        toggle.textContent = '☀️'; // sun emoji for light mode
    } else {
        toggle.textContent = '🌙'; // moon emoji for dark mode
    }
});

// API endpoint configuration (for your reference)
const API_CONFIG = {
  contact: '/api/contact',
  projects: '/api/projects'
  // Add more endpoints as needed
};
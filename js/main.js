// main.js - Common JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') && 
            !event.target.closest('.nav-links') && 
            !event.target.closest('.mobile-menu-icon')) {
            navLinks.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add box shadow to header on scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }
});
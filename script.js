// Smooth scrolling for internal links
const internalLinks = document.querySelectorAll('a[href^="#"]');

internalLinks.forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Cache frequently used elements
const loader = document.querySelector('#loader-container');
const greeting = document.querySelector('#greeting');
const header = document.querySelector('#header');
const pangalan = document.querySelector('#pangalan');
const cta = document.querySelector('#cta');
const menu = document.getElementById('menu');
const closeMenu = document.getElementById('close-menu');
const openMenu = document.getElementById('open-menu');

// Animation and element reveal for wider screens
if (window.matchMedia('(min-width: 1024px)').matches) {
  setTimeout(() => {
    loader.remove();
    header.classList.remove('invisible');
  }, 3600);

  setTimeout(() => greeting.classList.add('fade-in'), 4000);
  setTimeout(() => pangalan.classList.add('fade-in'), 5000);
  setTimeout(() => cta.classList.add('fade-in'), 6500);
}

// Toggle menu function for reusability
const toggleMenu = () => menu.classList.toggle('hidden-menu');

// Add event listeners for menu toggling
closeMenu.addEventListener('click', toggleMenu);
openMenu.addEventListener('click', toggleMenu);
document.querySelectorAll('#menu a').forEach(navLink => {
  navLink.addEventListener('click', toggleMenu);
});



// smooth scrolling
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

const loader = document.querySelector('#loader-container');
const greeting = document.querySelector('#greeting');
const header = document.querySelector('#header');
const pangalan = document.querySelector('#pangalan');
const cta = document.querySelector('#cta');
const menu = document.getElementById('menu');
const closeMenu = document.getElementById('close-menu');
const openMenu = document.getElementById('open-menu');

if (window.matchMedia('(min-width: 1024px)').matches) {
  setTimeout(() => {
    loader.remove();
    header.classList.remove('invisible');
  }, 3600);

  setTimeout(() => greeting.classList.add('fade-in'), 4000);
  setTimeout(() => pangalan.classList.add('fade-in'), 5000);
  setTimeout(() => cta.classList.add('fade-in'), 6500);
} else {
    loader.remove();
    header.classList.remove('invisible');
    setTimeout(() => greeting.classList.add('fade-in'), 1000);
    setTimeout(() => pangalan.classList.add('fade-in'), 2000);
    setTimeout(() => cta.classList.add('fade-in'), 3500);
}

// toggle menu function 
const toggleMenu = () => menu.classList.toggle('hidden-menu');

// listeners for menu toggling
closeMenu.addEventListener('click', toggleMenu);
openMenu.addEventListener('click', toggleMenu);
document.querySelectorAll('#menu a').forEach(navLink => {
  navLink.addEventListener('click', toggleMenu);
});



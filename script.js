document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const loader = document.querySelector('#loader-container');
const greeting = document.querySelector('#greeting');
const header = document.querySelector('#header');
const pangalan = document.querySelector('#pangalan');
const cta = document.querySelector('#cta');

if (window.matchMedia("(min-width: 1024px)").matches) {
    setTimeout(() => {
        loader.remove();
        header.classList.remove('invisible');
    }, 3600); 
  
    setTimeout(() => {
        greeting.classList.add('fade-in');
    }, 4000);
  
    setTimeout(() => {
        pangalan.classList.add('fade-in');
    }, 5000);
  
    setTimeout(() => {
        cta.classList.add('fade-in');
    }, 6500);
}

document.getElementById("close-menu").addEventListener("click", function () {
    document.getElementById("menu").classList.toggle("hidden-menu");
});

document.getElementById("open-menu").addEventListener("click", function () {
    document.getElementById("menu").classList.toggle("hidden-menu");
});

document.querySelectorAll('#menu a').forEach(navLink => {
    navLink.addEventListener('click', function() {
        document.getElementById('menu').classList.toggle('hidden-menu');
    });
});

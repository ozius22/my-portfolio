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

setTimeout(() => {
    loader.remove();
    header.classList.remove('invisible')
}, 3600); 

setTimeout(() => {
    greeting.classList.add('fade-in')
}, 4000)

setTimeout(() => {
    pangalan.classList.add('fade-in')
}, 5000)

setTimeout(() => {
    cta.classList.add('fade-in')
}, 6500)

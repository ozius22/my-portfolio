document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    alert('Thank you for your message! I will get back to you soon.');
    form.reset();
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
            const currentId = section.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('text-blue-500');
                if (link.getAttribute('href').includes(currentId)) {
                    link.classList.add('text-blue-500');
                }
            });
        }
    });
});
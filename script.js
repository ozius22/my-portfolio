document.addEventListener('DOMContentLoaded', () => {
    const opening = document.createElement("div");
    opening.id = "opening";
    opening.className =
      "fixed hidden lg:flex flex-col justify-center items-center z-10 top-0 left-0 w-full h-full bg-white";
    
    opening.innerHTML = `
        <svg viewBox="0 0 1000 1000">
            <g>
                <polygon id="triangle1" points="500,50 950,500 50,500" fill="white">
                    <animate 
                    attributeName="points" 
                    dur="1.5s"
                    begin="1.7s"
                    fill="freeze"
                    from="500,50 950,500 50,500" 
                    to="400,100 500,300 300,300" />
                    <animate
                    attributeName="opacity"
                    dur="1.5s"
                    begin="1.7s"
                    from="1"
                    to="0.1"
                    fill="freeze" />
                    <animate
                    attributeName="opacity"
                    dur="1.5s"
                    begin="1.7s"
                    from="1"
                    to="0.1"
                    fill="freeze" />
                    <animate 
                    attributeName="fill" 
                    from="white" 
                    to="black" 
                    dur="1.5s" 
                    begin="1s"
                    fill="freeze" 
                    />
                </polygon>
                
                <polygon id="triangle2" points="500,950 950,500 50,500" fill="white">
                    <animate 
                    attributeName="points" 
                    dur="1.5s"
                    begin="1.7s"
                    fill="freeze"
                    from="500,950 950,500 50,500" 
                    to="675,600 875,700 775,900" />
                    <animate
                    attributeName="opacity"
                    dur="1.5s"
                    begin="1.7s"
                    from="1"
                    to="0.1"
                    fill="freeze" />
                    <animate 
                    attributeName="fill" 
                    from="white" 
                    to="black" 
                    dur="1.5s" 
                    begin="1s"
                    fill="freeze" 
                    />
                </polygon>
            </g>
        </svg>
    `;

    const trianglesDark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    trianglesDark.setAttribute("id", "triangles-Dark");
    trianglesDark.setAttribute("class", "hidden show-3xl absolute inset-0 w-full h-full z-0");
    trianglesDark.setAttribute("viewBox", "0 0 1000 1000");
    trianglesDark.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", "400,100 500,300 300,300");
    polygon.setAttribute("fill", "#313F5C");
    polygon.setAttribute("opacity", "1");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M675,600 L875,700 L775,900 Z");
    path.setAttribute("fill", "#313F5C");
    path.setAttribute("opacity", "1");

    trianglesDark.appendChild(polygon);
    trianglesDark.appendChild(path);

    // FOR LOADING SCREEN AND ANIMATION
    const loader = document.querySelector('#loader-container');
    const greeting = document.querySelector('#greeting');
    const header = document.querySelector('#header');
    const pangalan = document.querySelector('#pangalan');
    const cta = document.querySelector('#cta');
    const home = document.querySelector('#home');
    
    document.body.appendChild(opening)
    
    setTimeout(() => loader.remove(), 1200);

    if (window.matchMedia('(min-width: 1800px)').matches) {
        setTimeout(() => {
            home.scrollIntoView();
            document.body.removeChild(opening)
        }, 4000);

        setTimeout(() => greeting.classList.add('fade-in'), 3500);
        setTimeout(() => pangalan.classList.add('fade-in'), 5000);
        setTimeout(() => cta.classList.add('fade-in'), 5700);
        setTimeout(() => header.classList.remove('hidden-main-menu'), 7000);
    } else {
        document.body.removeChild(opening)
        setTimeout(() => greeting.classList.add('fade-in'), 1200);
        setTimeout(() => pangalan.classList.add('fade-in'), 2000);
        setTimeout(() => cta.classList.add('fade-in'), 3000);
        setTimeout(() => header.classList.remove('hidden-main-menu'), 4500);
    }

    // FOR UNDERLINE NAVIGATION
    const navLinks = document.querySelectorAll('.nav-link');
    const navContainer = document.querySelector('.nav-container');
    let underline = document.querySelector('.traveling-underline');
    let currentActive = null;

    // position underline
    function positionUnderline(element, show = true) {
        if (!element || !underline) return;
        
        const rect = element.getBoundingClientRect();
        const parentRect = navContainer.getBoundingClientRect();

        const width = rect.width * 1.2;
        const leftOffset = rect.left - parentRect.left + (rect.width - width) / 2;
        
        underline.style.width = `${width }px`;
        underline.style.left = `${leftOffset}px`;
        underline.style.opacity = show ? '1' : '0';
    }

    // handle hover
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            positionUnderline(link);
        });

        link.addEventListener('mouseleave', () => {
            if (currentActive) {
                positionUnderline(currentActive);
            } else {
                if (underline) underline.style.opacity = '0';
            }
        });
    });

    // check in view
    function checkSectionInView() {
        const sections = document.querySelectorAll('section');
        let found = false;

        sections.forEach(section => {
            if (!section) return;
            
            const rect = section.getBoundingClientRect();
            const id = section.id;
            
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);
                
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                    currentActive = correspondingLink;
                    positionUnderline(correspondingLink);
                }
                found = true;
            }
        });

        if (!found) {
            currentActive = null;
            if (underline) underline.style.opacity = '0';
        }
    }

    // check on scroll and initial load
    window.addEventListener('scroll', checkSectionInView);
    window.addEventListener('resize', () => {
        if (currentActive) positionUnderline(currentActive);
    });
    
    // initial check
    setTimeout(checkSectionInView, 500); 

    
    // MOBILE MENU
    const menu = document.getElementById('menu');
    const closeMenu = document.getElementById('close-menu');
    const openMenu = document.getElementById('open-menu');
    const mobileLinks = document.querySelectorAll('#menu a');

    function isMenuVisible() {
        return !menu.classList.contains('hidden-menu');
    }

    function toggleBodyScroll(preventScroll) {
        if (preventScroll) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.height = '';
    }
    }

    // toggle menu function 
        const toggleMenu = (preventScroll) => {
        menu.classList.toggle('hidden-menu');

        toggleBodyScroll(preventScroll);
    }

    function closeMenuAndRestoreScroll() {
        if (isMenuVisible()) {
            menu.classList.add('hidden-menu');
            toggleBodyScroll(false);
        }
    }

    function handleViewportChange() {
        const desktopView = window.innerWidth > 768; 
        if (desktopView) {
            closeMenuAndRestoreScroll();
        }
    }

    // listeners for menu toggling
    closeMenu.addEventListener('click', () => toggleMenu(false));
    openMenu.addEventListener('click', () => toggleMenu(true));
    mobileLinks.forEach(navLink => {
        navLink.addEventListener('click', () => toggleMenu(false));
    });

    window.addEventListener('resize', handleViewportChange);

    function updateMobileMenuActiveState() {
        const sections = document.querySelectorAll('section');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        
        // Check which section is in view
        sections.forEach(section => {
            if (!section) return;
            
            const rect = section.getBoundingClientRect();
            const id = section.id;
            
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                const correspondingLink = document.querySelector(`.mobile-nav-link[href="#${id}"]`);
                
                mobileNavLinks.forEach(link => link.classList.remove('active-section'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active-section');
                }
            }
        });
    }
    
    // check on scroll
    window.addEventListener('scroll', updateMobileMenuActiveState);
    
    // initial check
    setTimeout(updateMobileMenuActiveState, 500);
    handleViewportChange();

    // prevent scroll in mobile-menu
    toggleBodyScroll(isMenuVisible());

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

    // DARK MODE
    const darkMode = document.getElementById('switch-dark');
    const lightMode = document.getElementById('switch-light');
    const darkModeMobile = document.getElementById('switch-dark-mobile');
    const lightModeMobile = document.getElementById('switch-light-mobile');

    const logoLight = document.getElementById('logo-light');
    const logoDark = document.getElementById('logo-dark');
    const darkButtons = document.querySelectorAll('.cta-dark');
    const trianglesLight = document.getElementById('triangles-light');
    const about = document.getElementById('about');
    const portrait = document.getElementById('portrait');
    const portraitDark = document.getElementById('portrait-dark');
    const ctaLight = document.getElementById('cta-light');
    const elements = document.querySelectorAll('p, h3, h4, h2');
    const serviceLogos = document.querySelectorAll('#backend, #backend1, #frontend, #frontend1, #others, #others1');
    const sections = document.querySelectorAll('#projects, body, #contact, #philosopy, footer');
    const projects = document.querySelectorAll('#project');
    const fields = document.querySelectorAll('#form-field');
    const menuIcons = document.querySelectorAll('#linkedIn, #linkedIn1, #git, #git1, #insta, #insta1');

    function setDarkMode(enabled) {
        // toggle the 'dark-mode' class on each element
        header.classList.toggle('dark-mode');
        home.classList.toggle('dark-mode');
        navLinks.forEach(link => link.classList.toggle('dark-mode'));
        pangalan.classList.toggle('dark-mode');
        darkButtons.forEach(link => link.classList.toggle('dark-mode'));
        about.classList.toggle('dark-mode');
        portraitDark.classList.toggle('dark-mode');
        portrait.classList.toggle('dark-mode');
        ctaLight.classList.toggle('dark-mode');
        elements.forEach(link => link.classList.toggle('dark-mode'));
        serviceLogos.forEach(link => link.classList.toggle('dark-mode'));
        sections.forEach(link => link.classList.toggle('dark-mode'));
        projects.forEach(link => link.classList.toggle('dark-mode'));
        fields.forEach(link => link.classList.toggle('dark-mode'));
        menu.classList.toggle('dark-mode');
        mobileLinks.forEach(link => link.classList.toggle('dark-mode'));
        menuIcons.forEach(link => link.classList.toggle('dark-mode'));
        
        // switch visibility
        if (enabled) {
        darkMode.classList.remove('md:block');
        lightMode.classList.add('md:block');
        darkModeMobile.classList.add('hidden');
        lightModeMobile.classList.remove('hidden');

        logoLight.classList.remove('md:block');
        logoDark.classList.add('md:block');
        trianglesLight.classList.remove('show-3xl');
        home.appendChild(trianglesDark);

        } else {
        lightMode.classList.remove('md:block');
        darkMode.classList.add('md:block');
        darkModeMobile.classList.remove('hidden');
        lightModeMobile.classList.add('hidden');

        logoDark.classList.remove('md:block');
        logoLight.classList.add('md:block');
        trianglesLight.classList.add('show-3xl');
        home.removeChild(trianglesDark);
        }
    }
  
    darkMode.addEventListener('click', () => setDarkMode(true));
    lightMode.addEventListener('click', () => setDarkMode(false));
    darkModeMobile.addEventListener('click', () => setDarkMode(true));
    lightModeMobile.addEventListener('click', () => setDarkMode(false));
});
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

    // FOR LOADING SCREEN AND ANIMATION
    const loader = document.querySelector('#loader-container');
    const greeting = document.querySelector('#greeting');
    const header = document.querySelector('#header');
    const pangalan = document.querySelector('#pangalan');
    const cta = document.querySelector('#cta');
    
    document.body.appendChild(opening)
    
    const diamond =  document.querySelector('#opening');

    setTimeout(() => loader.remove(), 1200);

    if (window.matchMedia('(min-width: 1024px)').matches) {
        setTimeout(() => {
            diamond.remove();
            header.classList.remove('invisible');
        }, 4000);

        setTimeout(() => greeting.classList.add('fade-in'), 4500);
        setTimeout(() => pangalan.classList.add('fade-in'), 6000);
        setTimeout(() => cta.classList.add('fade-in'), 6700);
    } else {
        diamond.remove();
        setTimeout(() => header.classList.remove('invisible'), 1000);
        setTimeout(() => greeting.classList.add('fade-in'), 1000);
        setTimeout(() => pangalan.classList.add('fade-in'), 2000);
        setTimeout(() => cta.classList.add('fade-in'), 3500);
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

    // listeners for menu toggling
    closeMenu.addEventListener('click', () => toggleMenu(false));
    openMenu.addEventListener('click', () => toggleMenu(true));
    document.querySelectorAll('#menu a').forEach(navLink => {
        navLink.addEventListener('click', () => toggleMenu(false));
    });

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
});
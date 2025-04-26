// ---------- Opening Animation Element ----------
const opening = document.createElement("div");
opening.id = "opening";
opening.className =
  "fixed hidden lg:flex flex-col justify-center items-center z-10 top-0 left-0 w-full h-full bg-white";
opening.innerHTML = `
    <svg viewBox="0 0 1000 1000">
        <g>
            <polygon id="triangle1" points="500,50 950,500 50,500" fill="black">
                <animate 
                attributeName="points" 
                dur="1.5s"
                begin="0.2s"
                fill="freeze"
                from="500,50 950,500 50,500" 
                to="400,100 500,300 300,300" />
                <animate
                attributeName="opacity"
                dur="1.5s"
                begin="0.2s"
                from="1"
                to="0.1"
                fill="freeze" />
                <animate
                attributeName="opacity"
                dur="1.5s"
                begin="0.2s"
                from="1"
                to="0.1"
                fill="freeze" />
                />
            </polygon>
            
            <polygon id="triangle2" points="500,950 950,500 50,500" fill="black">
                <animate 
                attributeName="points" 
                dur="1.5s"
                begin="0.2s"
                fill="freeze"
                from="500,950 950,500 50,500" 
                to="675,600 875,700 775,900" />
                <animate
                attributeName="opacity"
                dur="1.5s"
                begin="0.2s"
                from="1"
                to="0.1"
                fill="freeze" />
                />
            </polygon>
        </g>
    </svg>
`;

// ---------- DOM Element References ----------
const loader = document.querySelector("#loader-container");
const greeting = document.querySelector("#greeting");
const header = document.querySelector("#header");
const pangalan = document.querySelector("#pangalan");
const cta = document.querySelector("#cta");
const home = document.querySelector("#home");
const navLinks = document.querySelectorAll(".nav-link");
const navContainer = document.querySelector(".nav-container");
let underline = document.querySelector(".traveling-underline");
const menu = document.getElementById("menu");
const closeMenu = document.getElementById("close-menu");
const openMenu = document.getElementById("open-menu");
const mobileLinks = document.querySelectorAll("#menu a");
const darkMode = document.getElementById("switch-dark");
const lightMode = document.getElementById("switch-light");
// const darkModeMobile = document.getElementById("switch-dark-mobile");
// const lightModeMobile = document.getElementById("switch-light-mobile");
const logoLight = document.getElementById("logo-light");
const logoDark = document.getElementById("logo-dark");
const darkButtons = document.querySelectorAll(".cta-dark");
const trianglesLight = document.getElementById("triangles-light");
const about = document.getElementById("about");
const portrait = document.getElementById("portrait");
const portraitDark = document.getElementById("portrait-dark");
const ctaLight = document.getElementById("cta-light");
const elements = document.querySelectorAll("p, h3, h4, h2");
const serviceLogos = document.querySelectorAll(
  "#backend, #backend1, #frontend, #frontend1, #others, #others1"
);
const sections = document.querySelectorAll(
  "#projects, body, #contact, #philosopy, footer"
);
const projects = document.querySelectorAll("#project");
const fields = document.querySelectorAll("#form-field");
const menuIcons = document.querySelectorAll(
  "#linkedIn, #linkedIn1, #git, #git1, #insta, #insta1"
);
const scrollIndicator = document.getElementById("scrollIndicator");
const tooltips = document.querySelectorAll(".tooltip");

// Track current active navigation item
let currentActive = null;

// ---------- Loader Handling ----------
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => loader.remove(), 1000);
});

const observer = new MutationObserver((mutationsList) => {
  for (let mutation of mutationsList) {
    if (mutation.removedNodes.length > 0) {
      mutation.removedNodes.forEach((node) => {
        if (node.id === "loader-container") {
          onLoaderRemoved();
          observer.disconnect();
        }
      });
    }
  }
});

if (loader && loader.parentNode) {
  observer.observe(loader.parentNode, { childList: true });
}

function onLoaderRemoved() {
  const delay = 2000;
  const isLargeScreen = window.matchMedia("(min-width: 1800px)").matches;

  if (isLargeScreen) {
    document.body.appendChild(opening);

    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.removeChild(opening);
    }, 4000 - delay);

    setTimeout(() => greeting.classList.add("fade-in"), 3500 - delay);
    setTimeout(() => pangalan.classList.add("fade-in"), 5000 - delay);
    setTimeout(() => cta.classList.add("fade-in"), 5700 - delay);
    setTimeout(() => header.classList.remove("hidden-main-menu"), 7000 - delay);
    setTimeout(() => scrollIndicator.classList.add("fade-in"), 7000 - delay);
  } else {
    greeting.classList.add("fade-in");
    setTimeout(() => pangalan.classList.add("fade-in"), 700);
    setTimeout(() => cta.classList.add("fade-in"), 3000 - delay);
    setTimeout(() => header.classList.remove("hidden-main-menu"), 4000 - delay);
  }
}

// ---------- Navigation Underline ----------
function positionUnderline(element, show = true) {
  if (!element || !underline) return;

  const rect = element.getBoundingClientRect();
  const parentRect = navContainer.getBoundingClientRect();

  const width = rect.width * 1.2;
  const leftOffset = rect.left - parentRect.left + (rect.width - width) / 2;

  underline.style.width = `${width}px`;
  underline.style.left = `${leftOffset}px`;
  underline.style.opacity = show ? "1" : "0";
}

// Handle hover on nav links
navLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    positionUnderline(link);
  });

  link.addEventListener("mouseleave", () => {
    if (currentActive) {
      positionUnderline(currentActive);
    } else {
      if (underline) underline.style.opacity = "0";
    }
  });
});

// Check which section is in view for navigation highlighting
function checkSectionInView() {
  const sections = document.querySelectorAll("section");
  let found = false;

  sections.forEach((section) => {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const id = section.id;

    // Check if section is in middle of viewport
    if (
      rect.top <= window.innerHeight / 2 &&
      rect.bottom >= window.innerHeight / 2
    ) {
      const correspondingLink = document.querySelector(
        `.nav-link[href="#${id}"]`
      );

      navLinks.forEach((link) => link.classList.remove("active"));
      if (correspondingLink) {
        correspondingLink.classList.add("active");
        currentActive = correspondingLink;
        positionUnderline(correspondingLink);
      }
      found = true;
    }
  });

  if (!found) {
    currentActive = null;
    if (underline) underline.style.opacity = "0";
  }
}

// ---------- Mobile Menu Functions ----------
function isMenuVisible() {
  return !menu.classList.contains("hidden-menu");
}

function toggleBodyScroll(preventScroll) {
  if (preventScroll) {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
  } else {
    document.body.style.overflow = "";
    document.body.style.height = "";
  }
}

function toggleMenu(preventScroll) {
  menu.classList.toggle("hidden-menu");
  toggleBodyScroll(preventScroll);
}

function closeMenuAndRestoreScroll() {
  if (isMenuVisible()) {
    menu.classList.add("hidden-menu");
    toggleBodyScroll(false);
  }
}

function handleViewportChange() {
  const desktopView = window.innerWidth > 768;
  if (desktopView) {
    closeMenuAndRestoreScroll();
  }
}

// Update active state in mobile menu
function updateMobileMenuActiveState() {
  const sections = document.querySelectorAll("section");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  sections.forEach((section) => {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const id = section.id;

    if (
      rect.top <= window.innerHeight / 2 &&
      rect.bottom >= window.innerHeight / 2
    ) {
      const correspondingLink = document.querySelector(
        `.mobile-nav-link[href="#${id}"]`
      );

      mobileNavLinks.forEach((link) => link.classList.remove("active-section"));
      if (correspondingLink) {
        correspondingLink.classList.add("active-section");
      }
    }
  });
}

// ---------- Dark Mode Setup ----------
// Create dark mode triangles SVG
const trianglesDark = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);
trianglesDark.setAttribute("id", "triangles-Dark");
trianglesDark.setAttribute(
  "class",
  "hidden show-3xl absolute inset-0 w-full h-full z-0"
);
trianglesDark.setAttribute("viewBox", "0 0 1000 1000");
trianglesDark.setAttribute("xmlns", "http://www.w3.org/2000/svg");

const polygon = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "polygon"
);
polygon.setAttribute("points", "400,100 500,300 300,300");
polygon.setAttribute("fill", "#313F5C");
polygon.setAttribute("opacity", "1");

const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
path.setAttribute("d", "M675,600 L875,700 L775,900 Z");
path.setAttribute("fill", "#313F5C");
path.setAttribute("opacity", "1");

trianglesDark.appendChild(polygon);
trianglesDark.appendChild(path);

// Dark mode toggle function
function setDarkMode(enabled) {
  // Toggle the 'dark-mode' class on elements
  const elementsToToggle = [
    header,
    home,
    ...navLinks,
    pangalan,
    ...darkButtons,
    about,
    portraitDark,
    portrait,
    ctaLight,
    ...elements,
    ...serviceLogos,
    ...sections,
    ...projects,
    ...fields,
    menu,
    ...mobileLinks,
    ...menuIcons,
    ...tooltips,
  ];

  elementsToToggle.forEach((el) => {
    if (el) el.classList.toggle("dark-mode");
  });

  // Switch visibility based on mode
  if (enabled) {
    darkMode.classList.remove("md:block");
    lightMode.classList.add("md:block");
    // darkModeMobile.classList.add("hidden");
    // lightModeMobile.classList.remove("hidden");

    logoLight.classList.remove("md:block");
    logoDark.classList.add("md:block");
    trianglesLight.classList.remove("show-3xl");
    home.appendChild(trianglesDark);
  } else {
    lightMode.classList.remove("md:block");
    darkMode.classList.add("md:block");
    // darkModeMobile.classList.remove("hidden");
    // lightModeMobile.classList.add("hidden");

    logoDark.classList.remove("md:block");
    logoLight.classList.add("md:block");
    trianglesLight.classList.add("show-3xl");
    home.removeChild(trianglesDark);
  }
}

// ---------- Scroll Animation ----------
const scrollObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

// ---------- Event Listeners ----------
// Navigation and scrolling
window.addEventListener("scroll", checkSectionInView);
window.addEventListener("scroll", updateMobileMenuActiveState);
window.addEventListener("resize", () => {
  if (currentActive) positionUnderline(currentActive);
});
window.addEventListener("resize", handleViewportChange);

// Mobile menu
closeMenu.addEventListener("click", () => toggleMenu(false));
openMenu.addEventListener("click", () => toggleMenu(true));

mobileLinks.forEach((navLink) => {
  navLink.addEventListener("click", function (e) {
    e.preventDefault();
    toggleMenu(false);
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  });
});

// Dark mode toggle
darkMode.addEventListener("click", () => setDarkMode(true));
lightMode.addEventListener("click", () => setDarkMode(false));
// darkModeMobile.addEventListener("click", () => setDarkMode(true));
// lightModeMobile.addEventListener("click", () => setDarkMode(false));

// Smooth scrolling for internal links
const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// ---------- Initialize ----------
// Set up scroll animations
document.querySelectorAll(".animate-on-scroll").forEach((el) => {
  scrollObserver.observe(el);
});

// Initial checks
setTimeout(checkSectionInView, 500);
setTimeout(updateMobileMenuActiveState, 500);
handleViewportChange();
toggleBodyScroll(isMenuVisible());

// Form confirmation
const contact = document.getElementById("contact");

function getMessageBoxClasses(isSuccess, isDarkMode) {
  if (isSuccess) {
    return isDarkMode
      ? "mt-4 font-medium tracking-wider px-4 py-2 w-full max-w-lg lg:max-w-xl mx-auto bg-green-900 text-green-100 animate-slide-in text-center text-xs font-medium border-transparent md:px-12 md:text-sm flex items-center justify-center"
      : "mt-4 font-medium tracking-wider px-4 py-2 w-full max-w-lg lg:max-w-xl mx-auto bg-green-100 text-green-800 animate-slide-in text-center text-xs font-medium border-transparent md:px-12 md:text-sm flex items-center justify-center";
  } else {
    return isDarkMode
      ? "mt-4 font-medium tracking-wider px-4 py-2 w-full max-w-lg lg:max-w-xl mx-auto bg-red-900 text-red-100 animate-slide-in text-center text-xs font-medium border-transparent md:px-12 md:text-sm flex items-center justify-center"
      : "mt-4 font-medium tracking-wider px-4 py-2 w-full max-w-lg lg:max-w-xl mx-auto bg-red-100 text-red-800 animate-slide-in text-center text-xs font-medium border-transparent md:px-12 md:text-sm flex items-center justify-center";
  }
}

const form = document.getElementById("contact-form");
const messageBox = document.getElementById("form-message");
const submitButton = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  messageBox.textContent = "";
  messageBox.style.opacity = "0";
  messageBox.setAttribute("aria-hidden", "true");

  submitButton.disabled = true;
  submitButton.classList.add("opacity-50", "cursor-not-allowed");
  submitButton.textContent = "SENDING...";

  const formData = new FormData(form);

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    messageBox.textContent = "Message sent successfully!";
    const isDarkMode = contact.classList.contains("dark-mode");
    messageBox.className = getMessageBoxClasses(true, isDarkMode);

    messageBox.style.opacity = "1";
    messageBox.setAttribute("aria-hidden", "false");

    form.reset();

    submitButton.disabled = false;
    submitButton.classList.remove("opacity-50", "cursor-not-allowed");
    submitButton.textContent = "SEND MESSAGE";

    setTimeout(() => {
      messageBox.classList.add("transition-opacity", "duration-1000");
      messageBox.classList.remove("animate-slide-in");
      messageBox.style.opacity = "0";

      setTimeout(() => {
        messageBox.textContent = "";
        messageBox.setAttribute("aria-hidden", "true");
      }, 1000);
    }, 3000);
  } catch (error) {
    messageBox.textContent = "Something went wrong. Please try again.";
    const isDarkMode = contact.classList.contains("dark-mode");
    messageBox.className = getMessageBoxClasses(false, isDarkMode);

    messageBox.style.opacity = "1";
    messageBox.setAttribute("aria-hidden", "false");

    submitButton.disabled = false;
    submitButton.classList.remove("opacity-50", "cursor-not-allowed");
    submitButton.textContent = "SEND MESSAGE";

    setTimeout(() => {
      messageBox.classList.add("transition-opacity", "duration-1000");
      messageBox.classList.remove("animate-slide-in");
      messageBox.style.opacity = "0";

      setTimeout(() => {
        messageBox.textContent = "";
        messageBox.setAttribute("aria-hidden", "true");
      }, 1000);
    }, 5000);
  }
});

// Tooltip
document.querySelectorAll(".relative").forEach((item) => {
  item.setAttribute("tabindex", "0");

  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const tooltip = item.querySelector(".tooltip");
      tooltip.style.opacity = tooltip.style.opacity === "1" ? "0" : "1";
      tooltip.style.visibility =
        tooltip.style.visibility === "visible" ? "hidden" : "visible";
    }
  });
});

import { molecules } from "../data_lists/MOTW-data.js"
import { normalizeMoleculeKey } from "../js/utility.js"

const lenis = new Lenis()

lenis.on('scroll', (e) => {
    gsap.to(".background1 img", {
        yPercent: (e.progress.toFixed(2))*15
    })
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function updateReferences(moleculeKey) {
    const molecule = molecules[moleculeKey];

    const linkContainer = document.querySelector('.link-container');
    if (!molecule) {
        gsap.to("#loader-text", {text: `Molecule data not found`, duration: 0.5});
    }
    linkContainer.innerHTML = ''; // Clear existing links

    let totalLinks = Object.keys(molecule.references).length;
    let loadedLinks = 0;

    function checkLinkLoaded() {
        if (loadedLinks === totalLinks) {
            var tl = gsap.timeline();
            tl.to("#loader-text", { text: "", duration: 0.5, opacity: 0}, "start")
            tl.to("#molecule-name", {text: `Molecule Name`, duration: 0.5}, "start");
            tl.to("#molecule-name", {text: `${molecule.moleculeName}`, delay: 0.5, duration: 0.5})
            tl.from(".link-container a", {opacity: 0, y: 10, stagger: 0.2, delay: 0.2}, "start");
        }
    }

    if (molecule && molecule.references) {
        molecule.references.forEach(ref => {
            const anchor = document.createElement('a');
            anchor.className = "refer-link"
            anchor.href = ref.link;
            anchor.target = '_blank'; // Open link in a new tab

            const heading = document.createElement('h4');
            heading.textContent = ref.linkTitle;
            anchor.appendChild(heading);

            loadedLinks++;
            checkLinkLoaded()

            function anchorScale(value, mouseIn) {
                gsap.to(anchor, {
                    scale: value,
                })
                const weightValue = (mouseIn) ? "700" : "600"
                const colorValue = (mouseIn) ? "#007ab3" : "#000000";
                const letterSpaceValue = (mouseIn) ? "0.02rem" : "0.01rem";
                gsap.to(heading, {
                    delay: 0.15,
                    color: colorValue,
                    fontWeight: weightValue,
                    letterSpacing: letterSpaceValue,
                });
            }

            anchor.onmouseenter = () => {
                anchorScale(1.05, true);
            }
            anchor.ontouchstart = () => {
                anchorScale(1.05, true);
            }
            anchor.onmouseleave = () => {
                anchorScale(1, false);
            }
            anchor.ontouchcancel = () => {
                anchorScale(1, false);
            }
            anchor.ontouchend = () => {
                anchorScale(1, false);
            }

            linkContainer.appendChild(anchor);
        });
    }
}

gsap.to(window, { duration: 0.1, scrollTo: 0 });

gsap.to(".scroll-header", {
    top: `10%`,
    scrollTrigger: {
        trigger: ".link-container",
        start: "top 35%",
        end: "10% 20%",
        scrub: true
    }
})


// Get molecule key from URL parameter and update references
const rawKey = getQueryParam('molecule');
const moleculeKey = normalizeMoleculeKey(rawKey);
updateReferences(moleculeKey);
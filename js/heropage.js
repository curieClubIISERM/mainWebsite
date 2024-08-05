const lenis = new Lenis({
    prevent: (node) =>
        node.classList.contains('qatomcontroller') ||
        node.id === 'modal' ||
        node.classList.contains('e-details')
})
lenis.stop();

const maxfill = 165;
var footerInterval;
const nucleotideBaseList = ["A", "T", "G", "C"];
const baseX1 = 22, baseX2 = 220, baseY = 0;
const amplitude = (baseX2 - baseX1) / 2;

document.addEventListener("DOMContentLoaded", function () {
    particles();
    createSpanForHoverAnimation("#new-event");
    createSpanForHoverAnimation("#volunteer-btn");
    createSpanForHoverAnimation("#qbtn");
    createSpanForHoverAnimation2(".coordinatorinfo-container a", 2);
    recentContainerScrollAnimation();
    appendSinusoidalGroup(40, 40);
    dnaAnimation(40);
    galleryContainercursor();
    aboutAnimation()
    thanksContainercursor();
    footerAnimationTrigger();

});

setLenis();
settingIntervals()
scrollAnimations();





//      Functions      //

// Function to detect if the device is mobile
function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isSafari() {
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome/.test(ua);
  }
  
  function isSafariIOS() {
    const ua = navigator.userAgent;
    return /iP(hone|od|ad)/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua);
  }

if (isMobile() || isSafari() || isSafariIOS()) {
    document.querySelectorAll(".mobile").forEach(function (element) {
        element.style.display = "none";
    })
    document.querySelector('.heropage').style.backgroundImage = 'radial-gradient(rgb(1, 35, 139), rgb(0, 0, 0))';
    document.querySelector('.coordinatorinfo-container').style.backgroundImage = 'radial-gradient(rgb(1, 35, 139), rgb(0, 0, 0))';
    document.querySelector('.blobConatiner').style.display = 'flex';
    document.querySelector('.blobConatiner').style.position = 'absolute';
    document.querySelector('.blobConatiner').style.filter = 'blur(10px)';
    document.querySelectorAll('.blobConatiner svg').forEach(function (element) {
        element.style.width = '50vw';
        element.style.height = '50vw';
    });

}

function getRandomNucleotides() {
    let nucleotides = [];
    let randomIndex = Math.floor(Math.random() * 3);
    nucleotides.push(nucleotideBaseList[randomIndex]);
    if (randomIndex < 2) {
        nucleotides.push(nucleotideBaseList[(randomIndex + 1) % 2]);
    } else {
        nucleotides.push(secondNucleotideBase = nucleotideBaseList[2 + ((randomIndex + 1) % 2)]);
    }
    return nucleotides;
}

function scrollAnimations() {
    gsap.to("#page-nav nav", {
        top: "10%",
        scrollTrigger: {
            trigger: ".container",
            scrollar: "body",
            start: "top 65%",
            scrub: 1
        }
    });

    gsap.set(".scrollbar", { right: `${-10}vw`, transform: `skew(-10deg)` })
    gsap.to(".scrollbar", {
        right: `${0}vw`,
        transform: `skew(${0}deg)`,
        duration: 1,
        scrollTrigger: {
            trigger: ".container",
            start: "80% 60%",
            end: "30% 20%",
            scrub: true,
        }
    });
    gsap.to(".scrollbar", {
        scrollTrigger: {
            trigger: ".gallery-container",
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
            onUpdate: (e) => {
                progress = Math.round(e.progress * 100);
                gsap.set(".scrollbar", { clipPath: `polygon(0 0, 100% 0, 100% ${100 - progress}%, 0 ${100 - progress}%)` })
            }
        }
    })
}

function settingIntervals() {
    setInterval(() => {
        blobs = document.querySelectorAll(".blob");
        blobs.forEach((blob) => {
            const cx = 10;
            const cy = 10;
            const path = generateRandomBlob(cx, cy);
            gsap.to(blob, { attr: { d: `${path}` }, duration: 4 });
        });
    }, 5000)
}

function appendSinusoidalGroup(yIncrement, numberOfSugar) {
    var oldY = 0;

    // Create a new SVG element
    const dna = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // Set the attributes for the SVG element
    dna.setAttribute("id", "dna");
    dna.setAttribute("x", "0");
    dna.setAttribute("y", "0");
    dna.setAttribute("width", "220");
    dna.setAttribute("height", "1200");
    dna.setAttribute("viewBox", "0 0 250 1300");

    for (let i = 0; i < numberOfSugar; i++) {
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", `nucleotide${i}`);
        let sinusoidalX1 = baseX1 + generateSinusoidalValue(amplitude, oldY / 3);
        let sinusoidalX2 = baseX2 - generateSinusoidalValue(amplitude, oldY / 3);
        let y = baseY + (yIncrement * i);

        let nucleotides = getRandomNucleotides();

        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "phosphate");
        line.setAttribute("x1", sinusoidalX1);
        line.setAttribute("y1", y);
        line.setAttribute("x2", sinusoidalX2);
        line.setAttribute("y2", y);
        g.appendChild(line);

        let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle1.setAttribute("class", "sugar sugar1");
        circle1.setAttribute("cx", sinusoidalX1);
        circle1.setAttribute("cy", y);
        circle1.setAttribute("r", "21");
        circle1.setAttribute("nucleotide", nucleotides[0]) //Storing nucleotides Name 
        circle1.setAttribute("filter", "url(#distortFilter)");
        g.appendChild(circle1);

        let circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("class", "sugar sugar2");
        circle2.setAttribute("cx", sinusoidalX2);
        circle2.setAttribute("cy", y);
        circle2.setAttribute("r", "21");
        circle2.setAttribute("nucleotide", nucleotides[1]) //Storing other nucleotides Name 
        circle2.setAttribute("filter", "url(#distortFilter)");
        g.appendChild(circle2);

        oldY = oldY + yIncrement
        dna.appendChild(g);
    }

    document.querySelector(".dna-container").appendChild(dna);
}

function generateSinusoidalValue(amplitude, angle) {
    // Convert the angle from degrees to radians
    const angleInRadians = angle * (Math.PI / 180);

    // Calculate the sinusoidal value
    const sinusoidalValue = amplitude * (Math.sin(angleInRadians) + 1);

    return sinusoidalValue;
}

function dnaAnimation(strandNumber) {
    for (let i = 0; i < strandNumber; i++) {
        nucleotideGroup = document.querySelector(`#nucleotide${i}`);
        const line = nucleotideGroup.querySelector("line");
        const sugar1 = nucleotideGroup.querySelector(".sugar1");
        const sugar2 = nucleotideGroup.querySelector(".sugar2");
        const x1 = line.getAttribute("x1");
        const x2 = line.getAttribute("x2");

        let tl = gsap.timeline({ repeat: -1, delay: i * 0.000001 });
        tl.to(line, {
            attr: { x1: `${x1}`, x2: `${x2}` },
            duration: 0.01
        }, `nucleotide${(i + 28) % strandNumber - 1} start`)
            .to(sugar1, {
                attr: { cx: `${x1}` },
                duration: 0.01
            }, `nucleotide${(i + 28) % strandNumber - 1} start`)
            .to(sugar2, {
                attr: { cx: `${x2}` },
                duration: 0.01
            }, `nucleotide${(i + 28) % strandNumber - 1} start`)

        for (let j = 1; j < 27; j++) {
            const nextline = document.querySelector(`#nucleotide${(i + j) % strandNumber} line`)
            nextX1 = nextline.getAttribute('x1');
            nextX2 = nextline.getAttribute('x2');
            tl.to(line, {
                attr: { x1: `${nextX1}`, x2: `${nextX2}` },
                duration: 0.1
            }, `nucleotide${(i + j) % strandNumber} start`)
                .to(sugar1, {
                    attr: { cx: `${nextX1}` },
                    duration: 0.1
                }, `nucleotide${(i + j) % strandNumber} start`)
                .to(sugar2, {
                    attr: { cx: `${nextX2}` },
                    duration: 0.1
                }, `nucleotide${(i + j) % strandNumber} start`)
        }
        tl.to(line, {
            attr: { x1: `${x1}`, x2: `${x2}` },
            duration: 0.001
        }, `nucleotide${(i + 28) % strandNumber + 1} start`)
            .to(sugar1, {
                attr: { cx: `${x1}` },
                duration: 0.001
            }, `nucleotide${(i + 28) % strandNumber + 1} start`)
            .to(sugar2, {
                attr: { cx: `${x2}` },
                duration: 0.001
            }, `nucleotide${(i + 28) % strandNumber + 1} start`)
    }
}
function setLenis() {
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    const imgLenis = new Lenis({
        wrapper: document.querySelector("#modal"),
        content: document.querySelector(".img-grid"),
        smooth: true,
    })

    var lastProgress = 0;

    lenis.on('scroll', (e) => {
        var progress = (e.progress).toFixed(2);
        if (progress < 0 || progress > 1) {
            progress = lastProgress;
        }

        lastProgress = progress;
        var chemicalheight = (1 - progress) * maxfill;

        gsap.to("#chemical", {
            attr: { d: `M 7,180 c 0,0,2,35,15,35 s 17-35,17-35 V${chemicalheight} h-32 V170.5z` },
            ease: "none"
        });

        // Change initial position of bubble elements
        var maxcx = 190;
        var newcx = maxcx * (1 - progress);

        gsap.to(".bubble", {
            attr: { cy: `${newcx}` },
        });
    })

    function raf(time) {
        lenis.raf(time);
        imgLenis.raf(time);
        requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
}

function recentContainerScrollAnimation() {
    const imgConatiner = document.getElementById('.image-conatiner');
    const rImgsWrappers = document.querySelectorAll(".img-grid .img-wrapper");
    linkToGallery = document.createElement("a");
    linkToGallery.className = "link-to-gallery";
    linkToGallery.textContent = "View all images"
    linkToGallery.href = "";
    rImgsWrappers[rImgsWrappers.length - 1].appendChild(linkToGallery);

    const observerOptions = {
        root: imgConatiner,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // gsap.to(entry.target, { width: `${30}vw` });
                entry.target.classList.add('active');
            } else {
                // gsap.to(entry.target, { width: `${10}vw` });
                entry.target.classList.remove('active');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    rImgsWrappers.forEach(rImgsWrapper => {
        randX = Math.random() * 70;
        gsap.set(rImgsWrapper, { xPercent: randX });
        observer.observe(rImgsWrapper);
    });
}

function lightblueAnimation() {
    const lightblueElements = document.querySelectorAll('.lightblue');
    lightblueElements.forEach((element) => {
        const initialRandomLeft = -30 + Math.random() * 160;
        const initialRandomTop = Math.random() * 10;
        const randomLeft = -30 + Math.random() * 160;
        const randomTop = Math.random() * 10;
        gsap.set(element, {
            left: `${initialRandomLeft}%`,
            top: `${100 + initialRandomTop}%`
        });
        gsap.to(element, {
            left: `${randomLeft}%`,
            top: `${100 + randomTop}%`,
            duration: 10,
            ease: "none",
        })

    });
    footerInterval = setInterval(() => {
        lightblueElements.forEach((element) => {
            const randomLeft = -80 + Math.random() * 200;
            const randomTop = Math.random() * 10;
            const randWidth = Math.random() * 40;
            const randskew = Math.random() * 50;
            const randDuration = 6 + Math.round(Math.random() * 5);
            gsap.to(element, {
                left: `${randomLeft}%`,
                top: `${100 + randomTop}%`,
                width: `${randWidth}%`,
                transform: `skew(${randskew}deg)`,
                ease: "none",
                duration: randDuration
            });
        });
    }, 5000)
}

function footerAnimationTrigger() {
    const footer = document.getElementById('footer');
    const vivid = footer.querySelector('.vivid');

    const lightblueDivs = Array.from({ length: 33 }, () => {
        const div = document.createElement('div');
        div.classList.add('lightblue');
        return div;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lightblueDivs.forEach(div => vivid.appendChild(div));
                lightblueAnimation();
            } else {
                lightblueDivs.forEach(div => {
                    if (vivid.contains(div)) {
                        vivid.removeChild(div);
                    }
                });
                clearInterval(footerInterval);
            }
        });
    });

    observer.observe(footer);
}

function thanksContainercursor() {
    const thanksContainer = document.getElementById("thanks");
    const thankscursor = document.getElementById("thanks-cursor");
    const thanksPersons = document.querySelectorAll(".thanks-person");

    var mousein = false;

    function movecursor(x, y) {
        gsap.to(thankscursor, { left: `${x}px`, top: `${y}px` });
    }

    thanksContainer.onmousemove = (e) => {
        const rect = thanksContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        movecursor(x, y);
    };

    thanksContainer.ontouchmove = (e) => {
        const rect = thanksContainer.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        movecursor(x, y);
    };

    thanksContainer.onmouseleave = thanksContainer.ontouchend = () => {
        gsap.to(thankscursor, { scale: 0 });
        mousein = false;
    };

    thanksContainer.onmouseenter = thanksContainer.ontouchstart = () => {
        gsap.to(thankscursor, { scale: 0.5 });
        mousein = true;
    };

    thanksPersons.forEach((thanksPerson) => {
        thanksPerson.onmouseenter = thanksPerson.ontouchstart = () => {
            gsap.to(thankscursor, { scale: 1 });
        };
        thanksPerson.onmouseleave = thanksPerson.ontouchend = () => {
            gsap.to(thankscursor, { scale: 0.5 });
        };
    });

    lenis.on("scroll", ()=>{
        if (mousein) {
            gsap.to(thankscursor, { scale: 0})
        } else {
            gsap.to(thankscursor, { scale: 0.5})
        }
    })
};

function galleryContainercursor() {
    const galleryContainer = document.querySelector(".gallery-container");
    const gallerycursor = document.getElementById("gallery-cursor");
    const galleryWrappers = galleryContainer.querySelectorAll(".img-wrapper");
    const dna = galleryContainer.querySelector("#dna");
    const sugars = galleryContainer.querySelectorAll(".sugar");

    var mousein = false;

    function movecursor(x, y) {
        const rect = galleryContainer.getBoundingClientRect();
        const dnaRect = dna.getBoundingClientRect();
        const dnaLeft = dnaRect.left - rect.left;
        const dnaRight = dnaRect.width - rect.left;

        if (x <= dnaRight && x >= dnaLeft) {
            gsap.to(gallerycursor, { left: `${5}vw`, top: `${y}px` });
        } else {
            gallerycursor.textContent = "";
            gsap.to(gallerycursor, { left: `${x}px`, top: `${y}px` });
        }
    }

    galleryContainer.onmousemove = (e) => {
        const rect = galleryContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        movecursor(x, y);
    };

    galleryContainer.ontouchmove = (e) => {
        const rect = galleryContainer.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        movecursor(x, y);
    };

    galleryContainer.onmouseleave = galleryContainer.ontouchend = () => {
        gsap.to(gallerycursor, { scale: 0 });
        mousein = false;
    };

    galleryContainer.onmouseenter = galleryContainer.ontouchstart = () => {
        gsap.to(gallerycursor, { scale: 0.5 });
        mousein = true;
    };

    galleryWrappers.forEach((galleryWrapper) => {
        galleryWrapper.onmouseenter = galleryWrapper.ontouchstart = () => {
            gallerycursor.style.mixBlendMode = "normal";
            gsap.to(gallerycursor, { scale: 0.1 });
        };
        galleryWrapper.onmouseleave = galleryWrapper.ontouchend = () => {
            gallerycursor.style.mixBlendMode = "difference";
            gsap.to(gallerycursor, { scale: 0.5 });
        };
    });

    dna.onmouseenter = dna.ontouchstart = () => {
        gsap.to(gallerycursor, { scale: 0.5 });
    };

    dna.onmouseleave = dna.ontouchend = () => {
        gsap.to(gallerycursor, { scale: 0.5 });
    };

    sugars.forEach((sugar) => {
        sugar.onmouseenter = sugar.ontouchstart = (e) => {
            gallerycursor.textContent = e.target.getAttribute("nucleotide");
            gsap.to(e.target, { fill: "black" });
        };
        sugar.onmouseleave = sugar.ontouchend = (e) => {
            gsap.to(e.target, { fill: "#ffffff" });
        };
    });
    lenis.on("scroll", ()=> {
        if (mousein) {
            gsap.to(gallerycursor, { scale: 0 });
        } else {
            gsap.to(gallerycursor, { scale: 0.5 });
        }
    })
};

function spanner(element) {
    var realElement = document.querySelector(element);
    realElement.innerHTML = stringSpanner(realElement.innerHTML)
}

function stringSpanner(string) {
    let spanedText = "";
    for (let char of string) {
        spanedText += `<span>${char}</span>`;
    };
    return spanedText;
}

function sentenceSpanner(sentence) {
    let spannedSenetence = "";
    sentence.split(" ").forEach(word => {
        spannedSenetence += `<span>${word}</span> `;
    });
    return spannedSenetence;
}

function spanner2(element) {
    var realElement = document.querySelector(element);
    realElement.innerHTML = sentenceSpanner(realElement.innerHTML)
}

function aboutAnimation() {
    spanner(".about h2");
    spanner(".description")
    gsap.set(".about", { clipPath: `polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)`, transform: `scale(1.4)` });
    gsap.set(".about h2 span", { y: 50, opacity: 0 });
    gsap.set(".description span", { y: 20, opacity: 0 })
    aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.aboutWrapper',
            start: 'top-=50 top',
            end: 'bottom bottom',
            scrub: 1
        }
    });
    gsap.to(".about", {
        clipPath: `polygon(${0}% ${0}%, ${100}% ${0}%, ${100}% ${100}%, ${0}% ${100}%)`,
        transform: `scale(${1})`,
        scrollTrigger: {
            trigger: '.aboutWrapper',
            start: 'top-=100 top',
            end: 'bottom bottom',
            scrub: 1
        }
    }
    );
    aboutTl.to(".about .adjustmentlayer", { opacity: 0.8 });
    aboutTl.to(".about h2 span", { y: 0, opacity: 1, stagger: 0.1 }, "=+2");
    aboutTl.to(".description span", { y: 0, opacity: 1, stagger: 0.03 });
}

function particles() {
    const container = document.querySelector('.particles');
    const particleNum = 200; // Number of circles

    for (let i = 1; i <= 100; i++) {
        const circleContainer = document.createElement('div');
        circleContainer.classList.add('circle-container');

        const circle = document.createElement('div');
        circle.classList.add('circle');

        // Randomize initial position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        circleContainer.style.left = `${x}px`;
        circleContainer.style.top = `${y}px`;

        // Randomize animation duration
        const duration = Math.random() * 10 + 5;
        circle.style.animationDuration = `${duration}s`;

        circleContainer.appendChild(circle);
        container.appendChild(circleContainer);
    }

    for (let i = 0; i < particleNum; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');

        // Set random size for the circle
        const circleSize = Math.random() * 8 + 2; // Circle size between 2 and 10 pixels
        circle.style.width = `${circleSize}px`;
        circle.style.height = `${circleSize}px`;

        // Assign data-speed based on size (smaller size, higher speed)
        const speed = (10 - circleSize) / 10; // Speed inversely proportional to size
        circle.setAttribute('data-speed', speed.toFixed(2));

        // Set random position for the circle
        const x = Math.random() * 100; // X position in viewport width
        const startY = Math.random() * 10 + 150; // Start Y position
        const endY = Math.random() * 30 + 160; // End Y position

        // Set circle position
        circle.style.left = `${x}vw`;
        circle.style.transform = `translateY(${startY}vh)`;

        // Set animation properties
        const moveDuration = Math.random() * 9000 + 28000; // Duration between 28000ms and 37000ms
        const delay = Math.random() * 37000; // Delay before the animation starts

        circle.style.animation = `move-frames-${i} ${moveDuration}ms linear infinite`;
        circle.style.animationDelay = `${delay}ms`;

        // Create the keyframes for each circle
        const keyframes = `@keyframes move-frames-${i} {
            from {
                transform: translate3d(${x}vw, ${startY}vh, 0);
            }
            to {
                transform: translate3d(${x}vw, -${endY}vh, 0);
            }
        }`;

        // Append the keyframes to the style element
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = keyframes;
        document.head.appendChild(styleSheet);

        // Append circle to container
        container.appendChild(circle);
    }
}


//Setting initial Opacity of bubbles to 0 after 5 second of load
const initialOpacitySet = setTimeout(() => {
    document.querySelector("#hero-svg .bubbles").style.setProperty("--initialOpacity", 0);
    clearTimeout(initialOpacitySet);
}, 5000);

function createSpanForHoverAnimation(elementID) {
    var element = document.querySelector(elementID);
    const text = new SplitType(element, { types: 'word, char', tagName: 'span' });

    var element = document.querySelector(elementID);
    element.innerHTML = `<span class="first">${element.innerHTML}</span>` +
        `<span class="second">${element.innerHTML}</span>`;

    const firstSpans = element.querySelectorAll(".first span");
    const secondSpans = element.querySelectorAll(".second span");

    const mm = gsap.matchMedia();

    mm.add({
        // Define a media query for widths greater than 768px
        isDesktop: "(min-width: 768px)",
        // Define a media query for widths less than 768px
        isMobile: "(max-width: 767px)"
    }, (context) => {
        let displacement;

        if (context.conditions.isDesktop) {
            displacement = "0.9vw";
        } else if (context.conditions.isMobile) {
            displacement = "1.4vw";
        }

        gsap.set(secondSpans, { y: displacement });

        element.addEventListener("mouseenter", () => {
            // Animate first spans
            gsap.to(firstSpans, { y: `-${displacement}`, ease: "steps(12)", stagger: 0.01 });

            // Animate second spans
            gsap.to(secondSpans, { y: "0vw", stagger: 0.01 });
        });

        // Function to handle mouse leave
        element.addEventListener("mouseleave", () => {
            // Animate first spans back to original position
            gsap.to(firstSpans, { y: "0vw", stagger: 0.01 });

            // Animate second spans back to original position
            gsap.to(secondSpans, { y: displacement, ease: "steps(12)", stagger: 0.01 });
        });
    });
}

function createSpanForHoverAnimation2(elementID, displacement) {
    const element = document.querySelector(elementID);
    const text = new SplitType(element, { types: 'word, char', tagName: 'span' });

    element.innerHTML = ` <span class="first">${element.innerHTML}</span>` + " <span> </span> " + ` 
    <span class="second">${element.innerHTML}</span>`;

    const firstSpans = element.querySelectorAll(".first span");
    const secondSpans = element.querySelectorAll(".second span");

    gsap.set(secondSpans, { y: `-${displacement}vw` });

    element.addEventListener("mouseenter", () => {
        // Animate first spans
        gsap.to(firstSpans, { y: `${displacement}vw`, ease: "steps(12)", stagger: 0.01 });

        // Animate second spans
        gsap.to(secondSpans, { y: "0.3vw", stagger: 0.01 });
    });

    // Function to handle mouse leave
    element.addEventListener("mouseleave", () => {
        // Animate first spans back to original position
        gsap.to(firstSpans, { y: "0vw", stagger: 0.01 });

        // Animate second spans back to original position
        gsap.to(secondSpans, { y: `-${displacement}vw`, ease: "steps(12)", stagger: 0.01 });
    });
}

var loadertl = gsap.timeline({
    onComplete: () => lenis.start()
});
loadertl.from(".loader-svg", {
    opacity: 0,
    y: 1,
    scale: 0.6,
    duration: 2,
    transformOrigin: "bottom center",
    ease: "slow(0.1, 2, false)",
})
    .from(".loader-tittle", {
        opacity: 0,
        x: 10,
        stagger: 0.3,
        ease: "slow(0.7, 0.7, false)",
        onComplete: () => {
            if (windowLoaded) {
                loadertl.resume();
            } else {
                loadertl.pause();
            }
        }
    }, "-=0.5")
    .to(".loader-tittle", {
        opacity: 0,
        x: -10,
        stagger: 0.1,
        filter: "blur(10px)",
        ease: "slow(0.7, 0.7, false)",
    })
    .to(".loader-svg", {
        opacity: 0,
        y: -1,
        duration: 1,
        filter: "blur(20px)",
        ease: "slow(0.1, 2, false)",
    }, "-=0.5")
    .to(window, { scrollTo: "#main" })
    .to(".loader", {
        opacity: 0,
        filter: "blur(30px)",
        duration: 1,
        ease: "slow(0.1,0.7,false)",
    })
    .from(".testtube-container", { filter: `blur(${10}px)`, opacity: 0, duration: 0.5 }, "-=0.6")
    .from(".nav-600", { yPercent: -100, duration: 0.3 }, "-=0.6")
    .from(".heropage", { filter: `blur(${20}px)`, opacity: 0 }, "-=3.6")
    .from("#hero-svg", { filter: `blur(${20}px)`, opacity: 0, scale: 0.8, duration: 0.5 })
    .from(".panel *", { filter: `blur(${20}px)`, opacity: 0, yPercent: -10, stagger: 0.1 }, "-=0.5")



let windowLoaded = false;

window.addEventListener("load", () => {
    windowLoaded = true;
    if (loadertl.paused()) {
        loadertl.resume();
    }
});


function generateRandomBlob(cx, cy, numPoints = 6, rMin = 30, rMax = 70) {
    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function generatePoints() {
        const points = [];
        const angleStep = (2 * Math.PI) / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            const r = randomBetween(rMin, rMax);
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            points.push([x, y]);
        }

        return points;
    }

    function catmullRom2bezier(points) {
        const d = [];
        for (let i = 0; i < points.length; i++) {
            const p0 = points[(i - 1 + points.length) % points.length];
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];

            const control1 = [
                p1[0] + (p2[0] - p0[0]) / 6,
                p1[1] + (p2[1] - p0[1]) / 6,
            ];
            const control2 = [
                p2[0] - (p3[0] - p1[0]) / 6,
                p2[1] - (p3[1] - p1[1]) / 6,
            ];
            d.push(`C${control1[0]},${control1[1]} ${control2[0]},${control2[1]} ${p2[0]},${p2[1]}`);
        }
        return d;
    }

    const points = generatePoints();
    let pathData = `M${points[0][0]},${points[0][1]} `;
    pathData += catmullRom2bezier(points).join(" ");
    pathData += " Z";

    return pathData;
}

document.querySelectorAll('.nav-scrollers').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default anchor click behavior

        // Get the target section id from the data-target attribute
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);

        // Use GSAP to smoothly scroll to the target section
        gsap.to(window, { duration: 2, scrollTo: targetSection });
    });
});

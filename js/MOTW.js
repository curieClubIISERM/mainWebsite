const CHANGEDTEXT = ["Molecule", "of", "The", "Week"]
let windowLoaded = false;

// Initialize loader animation timeline
function initLoaderAnimation() {
    const loadertl = gsap.timeline();

    function setupInitialAnimation() {
        loadertl.from(".loader-svg", {
            opacity: 0,
            y: 1,
            scale: 0.6,
            duration: 2,
            transformOrigin: "bottom center",
            ease: "slow(0.1, 2, false)",
        }).from(".loader-tittle", {
            opacity: 0,
            x: 10,
            stagger: 0.3,
            ease: "slow(0.7, 0.7, false)",
        }, "-=0.5");
    }

    function updateLoaderTitle() {
        document.querySelectorAll(".loader-tittle").forEach((word, index) => {
            loadertl.to(word, {
                text: CHANGEDTEXT[index],
                onComplete: () => windowLoaded ? loadertl.resume() : loadertl.pause()
            });
        });
    }

    function setupFinalAnimation() {
        loadertl.to(".loader-tittle", {
            opacity: 0,
            x: -10,
            delay: 0.3,
            stagger: 0.1,
            filter: "blur(10px)",
            ease: "slow(0.7, 0.7, false)",
        }).to(".loader-svg", {
            opacity: 0,
            y: -1,
            duration: 1,
            filter: "blur(20px)",
            ease: "slow(0.1, 2, false)",
        }, "-=0.5").to(".loader", {
            opacity: 0,
            filter: "blur(30px)",
            duration: 1,
            ease: "slow(0.1, 0.7, false)",
        });
    }

    function onWindowLoad() {
        windowLoaded = true;
        if (loadertl.paused()) loadertl.resume();
    }

    setupInitialAnimation();
    updateLoaderTitle();
    setupFinalAnimation();
    window.addEventListener("load", onWindowLoad);
}

// Initialize loader animation
initLoaderAnimation();

import { drive } from "../assests/assest.js";
import { molecules } from "../data_lists/MOTW-data.js";
import { googleFormLinks } from "../data_lists/google_forms.js";

// Update volunteer link
function updateVolunteerLink() {
    const link = googleFormLinks.find(item => item.type === "Volunteering").link;
    document.getElementById("volunteer-link").href = link;
}

updateVolunteerLink();

const moleculeList = document.querySelector(".moleculeName");
const contentContainer = document.querySelector(".contentContainer");
const minSwiper = new Swiper(".min-molecule-swiper");
const maxSwiper = new Swiper(".max-molecule-swiper", {
    slidesPerView: 1,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
})

// Check if the publish date and time have passed
function isPastPublishDateTime(publishDate, publishTime) {
    const publishDateTime = new Date(`${publishDate}T${publishTime}`);
    return new Date() >= publishDateTime;
}

// Span characters of a string with <span> tags
function stringSpanner(string) {
    return [...string].map(char => `<span>${char}</span>`).join('');
}

// GSAP setup for buttons
gsap.set(".min-buttons a", {
    yPercent: 50,
    pointerEvents: "none"
});

const minMoleculeSwiper = document.querySelector('.min-molecule-swiper');

// Function to hide the pseudo-element
function hideBefore() {
    minMoleculeSwiper.classList.add('hide-before');
    minMoleculeSwiper.classList.remove('show-before');
}

// Function to show the pseudo-element
function showBefore() {
    minMoleculeSwiper.classList.remove('hide-before');
    minMoleculeSwiper.classList.add('show-before');
}

// Update content based on selected molecule
function updateContent(moleculeKey) {
    const molecule = molecules[moleculeKey];
    if (!molecule) return;

    const swiperWrapper = document.querySelector(".swiper-wrapper");
    swiperWrapper.innerHTML = ""; // Clear existing slides

    let totalImages = Object.keys(molecule.slides).length;
    let loadedImages = 0;


    gsap.to(".min-buttons a", {
        opacity: 0.5,
        yPercent: 20,
        stagger: 0.1,
        ease: "elastic.out(1, 0.3)",
    })
    showBefore(); // Shows the pseudo-element

    function checkAllImagesLoaded() {
        if (loadedImages === totalImages) {
            gsap.to(".min-buttons a", {
                opacity: 1,
                yPercent: 0,
                stagger: 0.1,
                ease: "elastic.out(1, 0.3)",
            });
            gsap.set(".min-buttons a", { pointerEvents: "all" });
            hideBefore(); // Hide pseudo-element
        }
    }

    for (const slide in molecule.slides) {
        const swiperSlide = document.createElement("div");
        swiperSlide.className = "swiper-slide";

        const img = document.createElement("img");
        img.src = molecule.slides[slide];
        img.ondragstart = () => false;

        gsap.set(img, { opacity: 0 });
        img.onload = () => {
            gsap.to(img, { opacity: 1, duration: 0.5 });
            loadedImages++;
            checkAllImagesLoaded();
        };

        swiperSlide.appendChild(img);
        swiperWrapper.appendChild(swiperSlide);
    }

    minSwiper.update();

    // Update credits
    const writer = document.getElementById("writer");
    const designer = document.getElementById("designer");
    const editor = document.getElementById("editor");
    const tl = gsap.timeline();
    if (!contentContainer.classList.contains("open")) {
        tl.set(".credits h4 strong, .credits h4 em", {
            opacity: 0,
            ease: "expo.inOut"
        });
    }
    tl.to("#writer, #designer, #editor", {
        opacity: 0,
        xPercent: 100,
        stagger: 0.1,
        onComplete: () => {
            tl.set("#writer, #designer, #editor, #writer em, #designer em, #editor em", { opacity: 0, xPercent: -100 })
            writer.querySelector("em").innerHTML = `${molecule.credits.Writer}`
            designer.querySelector("em").innerHTML = `${molecule.credits.Designer}`
            if (molecule.credits.Editor) {
                editor.querySelector("em").innerHTML = `${molecule.credits.Editor}`;
                if (!contentContainer.classList.contains("open")) {
                    gsap.set(".credits h4 strong, .credits h4 em", {
                        opacity: 0,
                        ease: "expo.inOut"
                    });
                }
                tl.to("#writer, #designer, #editor, #writer em, #designer em, #editor em", { opacity: 1, xPercent: 0, stagger: 0.1 });
            } else {
                if (!contentContainer.classList.contains("open")) {
                    gsap.set(".credits h4 strong, .credits h4 em", {
                        opacity: 0,
                        ease: "expo.inOut"
                    });
                }
                tl.to("#writer, #designer, #writer em, #designer em", { opacity: 1, xPercent: 0, stagger: 0.1 });
            }
        }

    })

    // Update molecule name display
    document.querySelector(".moleculeName-display").innerHTML = stringSpanner(molecule.moleculeName);

    // Update download buttons
    document.querySelectorAll(".downloadbtn").forEach(btn => {
        btn.setAttribute("href", molecule.pdflink);
        btn.setAttribute("download", `${molecule.moleculeName}.pdf`);
    });

    // Setup reference buttons
    const referencesButtons = document.querySelectorAll(".referencebtn");
    const basePath = 'MOTW-reference.html';
    referencesButtons.forEach((referenceButton) => {
        referenceButton.href = `${basePath}?molecule=${moleculeKey}`;
    });
}

function buttonAction() {

    gsap.set(".max-mode, .maxbuttonContainer, .upperbar", {
        opacity: 0,
        pointerEvents: "none"
    })

    // Min Zoom Button
    const minZoombtn = document.querySelector("#min-toggle");

    minZoombtn.addEventListener("click", () => {
        const minSwiperWrapper = contentContainer.querySelector(".swiper-wrapper");
        const minSwiperSlides = contentContainer.querySelectorAll(".swiper-slide");
        const activeIndex = minSwiper.activeIndex;

        if (minSwiperSlides.length > 0) {

            // Get the active slide and clone its image
            const activeSlide = minSwiperSlides[activeIndex];
            const clonedSlide = activeSlide.querySelector("img").cloneNode(true);

            // Append the cloned slide to the body
            document.body.appendChild(clonedSlide);

            // Get the position and size of the active slide
            const rect = activeSlide.querySelector("img").getBoundingClientRect();
            Object.assign(clonedSlide.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                borderRadius: getComputedStyle(document.querySelector(".min-molecule-swiper")).borderRadius,
                zIndex: 1000
            });

            // Set the opacity of all slides to 0
            minSwiperSlides.forEach(slide => slide.style.opacity = 0);

            // Move slides from minSwiper to maxSwiper
            minSwiperSlides.forEach(minSlide => {
                maxSwiper.slidesEl.appendChild(minSlide);
            });
            maxSwiper.update();

            // Get the updated position and size of the active slide after it is appended to maxSwiper
            const maxSwiperWrapper = maxModeContainer.querySelector(".swiper-wrapper");
            const maxSwiperSlides = maxSwiperWrapper.querySelectorAll(".swiper-slide");
            const maxActiveIndex = maxSwiper.activeIndex;
            const maxActiveSlide = maxSwiperSlides[maxActiveIndex];
            const updatedRect = maxActiveSlide.querySelector("img").getBoundingClientRect();

            // Animate the cloned slide to the updated position and size
            gsap.to(clonedSlide, {
                top: `${updatedRect.top}px`,
                left: `${updatedRect.left}px`,
                width: `${updatedRect.width}px`,
                height: `${updatedRect.height}px`,
                borderRadius: '0px',
                duration: 0.5,
                ease: "circ.out",
                onComplete: () => {
                    // Remove the cloned slide and reset opacity of the original slides
                    maxSwiper.slideTo(activeIndex, 0);
                    document.body.removeChild(clonedSlide);
                    minSwiperSlides.forEach(slide => slide.style.opacity = 1);
                }
            });

            // Timeline animations for the max mode
            const tl = gsap.timeline();
            gsap.set(".max-mode, .maxbuttonContainer, .upperbar", {
                opacity: 1,
                pointerEvents: "all"
            });
            tl.set(".swiper-pagination", {
                opacity: 0,
                yPercent: 80,
            })
                .set(".max-molecule-swiper", {
                    "--swiper-navigation-sides-offset": `${-10}%`,
                    "--swiper-navigation-color": `rgba(0, 0, 0, 0)`,
                    "--swiper-pagination-bullet-inactive-color": `rgba(208, 208, 208, 0)`
                })
                .set(".max-mode", {
                    backgroundColor: `#28293600`,
                    backdropFilter: `blur(${0}px)`
                })
                .set(".upparbackground", {
                    opacity: 0
                })
                .set(".max-button", {
                    opacity: 0,
                    y: 20,
                })
                .set(".moleculeName-display span", {
                    opacity: 0,
                    yPercent: 100,
                })
                .to(".max-mode", {
                    backgroundColor: `#2829368a`,
                    backdropFilter: `blur(${17}px)`
                })
                .to(".upparbackground", {
                    opacity: 1
                })
                .to(".max-molecule-swiper", {
                    "--swiper-navigation-sides-offset": `${10}vw`,
                    "--swiper-navigation-color": `rgba(0, 0, 0, 1)`,
                    "--swiper-pagination-bullet-inactive-color": `rgba(208, 208, 208, 1)`
                }, "swiper")
                .to(".swiper-pagination", {
                    opacity: 1,
                    yPercent: 0,
                }, "swiper")
                .to(".max-button", {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1
                }, 'upper')
                .to(".moleculeName-display span", {
                    opacity: 1,
                    yPercent: 0,
                    ease: "expo.inOut",
                    stagger: {
                        amount: 1
                    }
                }, 'upper');

        } else {
            alert('Please select a molecule from the molecule list visible after clicking on the "Molecule of the Week" logo.');
        }
    });

    // Max Zoom Button
    const maxZoombtn = document.querySelector("#max-toggle");

    maxZoombtn.addEventListener("click", () => {
        const maxSwiperWrapper = maxModeContainer.querySelector(".swiper-wrapper");
        const maxSwiperSlides = maxSwiperWrapper.querySelectorAll(".swiper-slide");
        const activeIndex = maxSwiper.activeIndex;

        // Get the active slide and clone its image
        const activeSlide = maxSwiperSlides[activeIndex];
        const clonedSlide = activeSlide.querySelector("img").cloneNode(true);

        if (maxSwiperWrapper.parentNode === maxSwiper.el) {
            // Append the cloned slide to the body
            document.body.appendChild(clonedSlide);

            // Get the position and size of the active slide
            const rect = activeSlide.querySelector("img").getBoundingClientRect();
            Object.assign(clonedSlide.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                objectPosition: "top",
                borderRadius: getComputedStyle(document.querySelector(".min-molecule-swiper")).borderRadius,
                zIndex: 1000
            });

            // Set the opacity of all slides to 0
            maxSwiperSlides.forEach(slide => slide.style.opacity = 0);

            // Move slides from maxSwiper to minSwiper
            maxSwiperSlides.forEach(maxSlide => {
                minSwiper.slidesEl.appendChild(maxSlide);
            });
            minSwiper.update();
            minSwiper.slideTo(activeIndex);

            // Get the updated position and size of the active slide after it is appended to minSwiper
            const updatedRectForLeft = document.querySelector(".min-molecule-swiper").getBoundingClientRect().left;
            const updatedRect = activeSlide.querySelector("img").getBoundingClientRect();

            // Animate the cloned slide to the updated position and size
            gsap.to(clonedSlide, {
                top: `${updatedRect.top}px`,
                left: `${updatedRectForLeft}px`,
                width: `${updatedRect.width}px`,
                height: `${updatedRect.height}px`,
                borderRadius: getComputedStyle(document.querySelector(".min-molecule-swiper")).borderRadius,
                duration: 0.5,
                ease: "circ.out",
                onComplete: () => {
                    // Add additional animations to the cloned slide
                    gsap.set(clonedSlide, {
                        clipPath: 'polygon(0 0, 100% 0%, 100% 100%, 0 100%)'
                    });
                    gsap.to(clonedSlide, {
                        clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
                        duration: 0.5,
                        ease: "circ.out",
                        onComplete: () => {
                            // Remove the cloned slide from the body
                            document.body.removeChild(clonedSlide);
                            gsap.set(".max-mode, .maxbuttonContainer, .upperbar", {
                                opacity: 0,
                                pointerEvents: "none"
                            });
                        }
                    });
                    // Reset opacity of the original slides
                    maxSwiperSlides.forEach(slide => slide.style.opacity = 1);
                }
            });

            // Hide elements and reset styles for max mode
            gsap.to(".swiper-pagination", {
                opacity: 0,
                yPercent: 80,
            });
            gsap.to(".max-molecule-swiper", {
                "--swiper-navigation-sides-offset": `${-10}%`,
                "--swiper-navigation-color": `rgba(0, 0, 0, 0)`,
                "--swiper-pagination-bullet-inactive-color": `rgba(208, 208, 208, 0)`
            });
            gsap.to(".max-button", {
                opacity: 0,
                y: 20,
            });
            gsap.to(".moleculeName-display span", {
                opacity: 0,
                yPercent: 100,
            });
            gsap.to(".max-mode", {
                backgroundColor: `#28293600`,
                backdropFilter: `blur(${0}px)`
            });
            gsap.to(".upparbackground", {
                opacity: 0
            });
        }
    });

    //Down Button
    const downloadButtons = document.querySelectorAll(".downloadbtn");

    downloadButtons.forEach((downloadButton) => {
        downloadButton.addEventListener("click", () => {
            const lineElement = downloadButton.querySelector("line");
            const polylineElement = downloadButton.querySelector("polyline");
            const tl = gsap.timeline();

            if (downloadButton.href) {
                // Initial animation frame
                tl.to(lineElement, {
                    attr: {
                        x1: "33",
                        y1: "27",
                        x2: "33",
                        y2: "27"
                    },
                    duration: 0.5,
                    ease: "power4.inOut",
                }, "initialFrame")
                    .to(polylineElement, {
                        attr: {
                            points: "18,42 33,42 48,42"
                        },
                        duration: 0.5,
                        ease: "power4.inOut",
                    }, "initialFrame")

                    // Second animation frame
                    .to(lineElement, {
                        attr: {
                            x1: "32",
                            y1: "1",
                            x2: "32",
                            y2: "1"
                        },
                        strokeWidth: "10",
                        duration: 0.5,
                        ease: "power4.inOut",
                    }, "secondFrame")

                    // Third animation frame
                    .to(lineElement, {
                        rotate: -360,
                        transformOrigin: "0 33",
                        duration: 2,
                        repeat: 2,
                        ease: "power4.inOut",
                    }, "thirdFrame")

                    // Last animation frame
                    .to(lineElement, {
                        attr: {
                            x1: "33",
                            y1: "40",
                            x2: "33",
                            y2: "40"
                        },
                        transformOrigin: "0 0",
                        strokeWidth: "0",
                        duration: 0.5,
                        ease: "power4.inOut",
                    }, "lastFrame")
                    .to(polylineElement, {
                        attr: {
                            points: "15,32 26,42 44,22"
                        },
                        duration: 0.5,
                        ease: "power4.inOut",
                        onComplete: () => {
                            // Reset to initial state
                            gsap.to(lineElement, {
                                attr: {
                                    x1: "33",
                                    y1: "3",
                                    x2: "33",
                                    y2: "53"
                                },
                                strokeWidth: "5",
                                duration: 0.5,
                                ease: "power4.inOut",
                            });
                            gsap.set(lineElement, { rotate: 0 });
                            gsap.to(polylineElement, {
                                attr: {
                                    points: "16,40 33,53 50,40"
                                },
                                duration: 0.5,
                                ease: "power4.inOut",
                            });
                        }
                    }, "lastFrame");
            } else {
                alert('Please select a molecule from the molecule list visible after clicking on the "Molecule of the Week" logo.');
            }
        });
    });

}

//Getting Molecules from moleculeList list into moleculeList element
for (const key in molecules) {
    if (molecules.hasOwnProperty(key)) {
        const { publishDate, publishTime, moleculeName } = molecules[key];
        if (isPastPublishDateTime(publishDate, publishTime)) {
            const li = document.createElement("li");
            li.textContent = moleculeName;
            li.dataset.key = key;
            li.lang = "en";
            moleculeList.appendChild(li);
        }
    }
}

//Setting Lenis 
const moleculeLenis = new Lenis({
    wrapper: document.querySelector(".moleculeName"),
    content: document.querySelector(".moleculeName li"),
    smooth: true,
})

function raf(time) {
    moleculeLenis.raf(time);
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)


//Getting Some Element
const moleculeConatiner = document.querySelector(".moleculeContainer");
const moleculeLogoContainerImg = moleculeConatiner.querySelector(".moleculelogoContainer img");
const mouseScrollerSymbol = document.getElementById("mouse-scroller-symbol");
const mouseWheelScroller = mouseScrollerSymbol.getElementById("mouse-scroller");
const arrows = mouseScrollerSymbol.querySelectorAll("polygon");
const maxModeContainer = document.querySelector(".max-mode");



// Mouse Scroller Symbol Animation
const arrowAnimations = [
    { points: "44.5,72.5 52.6,77.2 51.4,78.8", delay: 0 },
    { points: "59.5,71.5 51.6,78.8 50.4,77.2", delay: 0 },
    { points: "44.5,82.5 52.6,87.2 51.4,88.8", delay: 1 },
    { points: "59.5,81.5 51.6,88.8 50.4,87.2", delay: 1 },
    { points: "44.5,92.5 52.6,97.2 51.4,98.8", delay: 2 },
    { points: "59.5,91.5 51.6,98.8 50.4,97.2", delay: 2 },
];

// Vertical bounce animation for the mouse scroller symbol
gsap.to(mouseScrollerSymbol, {
    y: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    duration: 2
});

// Arrow animations within the mouse scroller symbol
arrows.forEach((arrow, index) => {
    // Animation for changing points attribute
    gsap.to(arrow, {
        duration: 4,
        attr: { points: arrowAnimations[index].points },
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: arrowAnimations[index].delay
    });

    // Animation for opacity
    gsap.fromTo(arrow, {
        opacity: 1
    }, {
        opacity: 0,
        duration: 2,
        repeat: -1,
        yoyo: true,
        delay: arrowAnimations[index].delay
    });
});

// Fill color animation for the mouse wheel scroller
gsap.to(mouseWheelScroller, {
    fill: "black",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    duration: 1
});


// Event Listener for opening the molecule container
moleculeLogoContainerImg.onclick = () => {
    moleculeConatiner.classList.toggle("open");
    mouseScrollerSymbol.classList.toggle("open");
    moleculeLogoContainerImg.classList.toggle("open");

    if (moleculeConatiner.classList.contains("open")) {
        // Initialize animation states
        gsap.set(".moleculeName li", { opacity: 0, xPercent: -100 });
        gsap.set(".moleculeNameWrapper h2", { opacity: 0, x: 0 });

        // Animate molecule names and title into view
        gsap.to(".moleculeName li", {
            opacity: 1,
            xPercent: 0,
            stagger: { amount: 1 },
            ease: "expo.inOut",
            delay: 0.5,
            duration: 0.5
        });
        gsap.to(".moleculeNameWrapper h2", {
            opacity: 1,
            x: 0,
            delay: 0.5,
            duration: 0.5
        });
    } else {
        // Animate molecule names and title out of view
        gsap.to(".moleculeName li", {
            opacity: 0,
            xPercent: 100,
            duration: 0.2,
            ease: "expo.inOut"
        });
        gsap.to(".moleculeNameWrapper h2", {
            opacity: 0,
            x: 10,
            duration: 0.1
        });
    }
};

// Event Listener for switching molecules
let oldDataset = null;
let isThrottled = false;

moleculeList.addEventListener("click", (event) => {
    const target = event.target;

    if (target.tagName === "LI" && !isThrottled) {
        if (oldDataset !== target.dataset.key) {
            minSwiper.slideTo(0, 1, true);
            updateContent(target.dataset.key);
            oldDataset = target.dataset.key;

            isThrottled = true;
            setTimeout(() => {
                isThrottled = false;
            }, 1500);
        }
    }
});

// Event Listener for opening the content container
contentContainer.addEventListener("click", () => {
    contentContainer.classList.toggle("open");

    if (contentContainer.classList.contains("open")) {
        // Initialize animation states
        gsap.set(".credits h4 strong, .credits h4 em", { opacity: 0, x: -20 });

        // Animate credits into view
        gsap.to(".credits h4 strong, .credits h4 em", {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            ease: "expo.inOut",
        });
    } else {
        // Animate credits out of view
        gsap.to(".credits h4 strong, .credits h4 em", {
            opacity: 0,
            ease: "expo.inOut"
        });
    }
});


buttonAction()

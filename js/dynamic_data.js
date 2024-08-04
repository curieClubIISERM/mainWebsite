import { upcomingEventList, recentEventList, onGoingSeriesList } from "../data_lists/events_data.js";
import { quotes } from "../data_lists/quotes_data.js";
import { coordinators } from "../data_lists/coordinators_data.js";
import { volunteers } from "../data_lists/thanks_data.js";
import { googleFormLinks } from "../data_lists/google_forms.js";
import { images } from "../data_lists/recent_event_memories.js";

const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
function addingImagesToRecentImages() {
    const container = document.querySelector('.img-grid');

    images.forEach(image => {
        const wrapper = document.createElement('div');
        wrapper.className = 'img-wrapper';

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;

        wrapper.appendChild(img);
        container.appendChild(wrapper);
    });
}

function addingConvenersinfo() {
    const container = document.querySelector('.coordinatorinfo-container');

    coordinators.forEach(coordinator => {
        const card = document.createElement('div');
        card.className = 'coordinfo-cards';

        const imgCircle = document.createElement('div');
        imgCircle.className = 'img-circle';

        const imgDiv = document.createElement('div');
        imgDiv.className = 'coord-img-div';
        imgDiv.style.backgroundImage = `url(${coordinator.image})`;

        imgCircle.appendChild(imgDiv);
        card.appendChild(imgCircle);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'coord-name';
        nameDiv.textContent = coordinator.name;
        card.appendChild(nameDiv);

        const positionDiv = document.createElement('div');
        positionDiv.className = 'coord-postion';
        positionDiv.textContent = coordinator.position;
        card.appendChild(positionDiv);

        container.appendChild(card);
    });

    const heading = document.createElement('h2');
    heading.className = 'coordinator-heading';
    heading.textContent = 'Current Conveners';
    container.appendChild(heading);
}

function addingVolunters() {
    const volunteersDiv = document.querySelector("#volunteers");
    const thanksCurser = document.getElementById("thanks-curser");
    volunteers.forEach(person => {
        const personDiv = document.createElement('div');
        personDiv.className = 'thanks-person';
        personDiv.textContent = person;
        personDiv.onmouseenter = () => {
            gsap.to(thanksCurser, { scale: 1 });
        }
        personDiv.onmouseleave = () => {
            gsap.to(thanksCurser, { scale: 0.5 });
        }
        volunteersDiv.appendChild(personDiv);
    });
}

function addingGoogleFormLinks() {
    for (let googlelink of googleFormLinks) {
        document.querySelector(".google-forms .footer-links-container").innerHTML += `<a href="${googlelink.link}">${googlelink.text}</a>`
    }
}

function addingSeriesToFooter() {
    for (let series of onGoingSeriesList) {
        document.querySelector(".series .footer-links-container").innerHTML += `<a href="${series.link}">${series.seriesName}</a>`
    }
}

function containerfunction(eventList, NoEventString, onDisableTranslation, onEnableTranslation, style) {
    const prevBtn = swiperContainer.querySelector(".swiper-button-prev");
    const swiperDiv = swiperContainer.querySelector(".swiper")
    const swiperWrapper = swiperContainer.querySelector(".swiper-wrapper");

    //Removing old Slides
    swiperWrapper.querySelectorAll(".main-slide").forEach(card => {
        swiperWrapper.removeChild(card);
    })
    noEventDiv = document.querySelector(".no-new-event-div");
    if (noEventDiv) {
        swiperWrapper.removeChild(noEventDiv)
    }

    //Creating Swiper 
    const swiper = new Swiper(swiperDiv, {
        direction: 'horizontal',
        slidesPerView: "auto",
        spaceBetween: 30,
        freeMode: true,
        speed: 1000,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    //Adding Cards 
    if (eventList.length > 0) {
        var index = 0;
        for (let event of eventList) {
            //creating elements
            let swiperSlide = document.createElement("div");
            let card = document.createElement("div");
            let cardContent = document.createElement("div");
            let eventDetailsDiv = document.createElement("div");
            let btnDiv = document.createElement("div");
            let cardTitle = document.createElement("h2");
            let eventType = document.createElement("h3");
            let overlayDiv = document.createElement("div");

            //Adding Classes
            swiperSlide.className = "swiper-slide main-slide";
            card.className = "e-card playing";
            card.style.transitionDelay = `${index / 20}s`;
            if (style == 1) {
                cardContent.className = "e-card-content";
                cardTitle.className = "e-card-title";
                eventDetailsDiv.className = "e-details";
                overlayDiv.className = "e-overlay";
            } else if (style == 2) {
                cardContent.className = "r-card-content";
                eventType.className = "r-card-type";
                eventDetailsDiv.className = "r-details";
                cardTitle.className = "r-card-title";
                overlayDiv.className = "r-card-overlay";
            } else if (style == 3) {
                cardContent.className = "s-card-content";
                cardTitle.className = "s-card-tittle";
                eventDetailsDiv.className = "s-details";
                btnDiv.className = "s-btn"
            }

            //Adding Details according to events
            if (style == 2) {
                eventType.textContent = event.type;
            }
            if (style == 1 || style == 2) {
                cardTitle.textContent = event.eventName;
            } else if (style == 3) {
                cardTitle.textContent = event.seriesName;
            }

            //Appending Details to Card Content
            if (style == 1 || style == 3) {
                cardContent.appendChild(cardTitle);
            } else if (style == 2) {
                cardContent.appendChild(eventType);
                eventDetailsDiv.appendChild(cardTitle)
            }

            if (style == 1) {
                //Adding Date info according to Event
                if (event.eventDate) {
                    let cardDate = document.createElement("p");
                    cardDate.className = "e-card-date";
                    cardDate.innerHTML = `<i class="fa-regular fa-calendar-days"></i><span>Date: </span><span>${event.eventDate}</span>`;
                    eventDetailsDiv.appendChild(cardDate);
                };

                //Adding Time info according to Event
                if (event.eventTime) {
                    let cardTime = document.createElement("p");
                    cardTime.className = "e-card-time";
                    cardTime.innerHTML = `<i class="fa-regular fa-clock"></i><span>Time: </span><span>${event.eventTime}</span>`;
                    eventDetailsDiv.appendChild(cardTime);
                };

                //Adding Venue info according to Event
                if (event.eventVenue) {
                    let cardVenue = document.createElement("p");
                    cardVenue.className = "e-card-venue";
                    cardVenue.innerHTML = `<i class="fa-solid fa-location-dot"></i><span>Venue: </span><span>${event.eventVenue}</span>`;
                    eventDetailsDiv.appendChild(cardVenue);
                }
            }

            //AddingDecription info according to Event
            if (event.eventDescription || event.seriesDescription) {
                let cardDescription = document.createElement("p");
                if (style == 1) {
                    cardDescription.className = "e-card-description";
                } else if (style == 2) {
                    cardDescription.className = "r-card-description";
                }
                if (style == 1 || style == 2) {
                    cardDescription.textContent = event.eventDescription;
                    eventDetailsDiv.appendChild(cardDescription);
                    cardContent.appendChild(eventDetailsDiv);
                    cardContent.appendChild(overlayDiv);
                }
                if (style == 3) {
                    cardDescription.className = "s-card-description";
                    cardDescription.textContent = event.seriesDescription;
                    cardDescription.style.webkitLineClamp = event.lineClamp
                    eventDetailsDiv.appendChild(cardDescription);
                }
            }

            if (style == 3) {
                //Adding links to card
                if ((event.link)) {
                    let ancherTag = document.createElement("a");
                    ancherTag.className = "s-btn"
                    ancherTag.setAttribute("href", event.link);
                    ancherTag.textContent = "Check Out"
                    btnDiv.appendChild(ancherTag);
                    eventDetailsDiv.appendChild(btnDiv);
                    cardContent.appendChild(eventDetailsDiv)
                }
            }

            //Adding Wave effect to card
            for (var i = 0; i < 3; i++) {
                let wave = document.createElement("div");
                wave.className = "wave";
                card.appendChild(wave)
            }

            //Appending Card Content to Card
            card.appendChild(cardContent);
            card.style.opacity = "0";
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transitionDelay = `none`;
            }, 100)

            //Appending Card to Swiper Slide
            swiperSlide.appendChild(card)

            //Appending Swiper Slide to Body
            swiperWrapper.appendChild(swiperSlide);

            index = index + 1;
        }
    } else {
        let swiperSlide = document.createElement("div");
        let noNewEventDiv = document.createElement("div");
        let noNewEvent = document.createElement("div");

        swiperSlide.className = "swiper-slide";
        noNewEventDiv.className = "no-new-event-div";
        noNewEvent.className = "no-new-event";

        noNewEvent.textContent = NoEventString;

        noNewEventDiv.appendChild(noNewEvent);
        swiperSlide.appendChild(noNewEventDiv);
        swiperWrapper.appendChild(swiperSlide);
    }
    var fillerSlide = document.createElement("div");
    fillerSlide.className = "swiper-slide filler-slide main-slide";
    swiperContainer.querySelector(".swiper-wrapper").appendChild(fillerSlide);

    //Definitng SVG animation
    function containerSVGAnmiation() {
        if (prevBtn.classList.contains("swiper-button-disabled")) {
            gsap.to(secSVGConatiner, { transform: `translate(${onDisableTranslation}%)` })
        } else {
            gsap.to(secSVGConatiner, { transform: `translate(${onEnableTranslation}%)` })
        }
    }

    gsap.to(secSVGConatiner, { transform: `translate(${onEnableTranslation}%)` })

    //Applying SVG animation
    swiperDiv.onclick = containerSVGAnmiation;
    swiperDiv.onmousemove = containerSVGAnmiation;
    swiper.onslidechange = containerSVGAnmiation;

}

function containerBtnForMobile() {
    const hambugerDiv = swiperContainer.querySelector('.hambuger');
    let isToggled = false;

    function toggleMenu(close = false) {
        const hamburgerSVG = hambugerDiv.querySelector('svg');
        const sectionContainer = swiperContainer.querySelector(".container-top-left");
        const line1 = hambugerDiv.querySelector("#line1");
        const line2 = hambugerDiv.querySelector("#line2");
        const line3 = hambugerDiv.querySelector("#line3");

        if (isToggled || close) {
            gsap.to(line1, { attr: { x1: 5, y1: 5, x2: 79.5, y2: 5 }, duration: 0.5 });
            gsap.to(line2, { attr: { x1: 5, y1: 32, x2: 60.5, y2: 32 }, duration: 0.5 });
            gsap.to(line3, { attr: { x1: 5, y1: 59, x2: 32.5, y2: 59 }, duration: 0.5 });
            gsap.to(sectionContainer, { borderWidth: '0vw', height: '0%', duration: 0.5 });
            gsap.to(hamburgerSVG, { backgroundColor: '#000000', stroke: '#F0F8FF', duration: 0.5 });
            hambugerDiv.classList.remove("clicked");
            document.removeEventListener('click', handleClickOutside);
            isToggled = false;
        } else {
            gsap.to(line1, { attr: { x1: 44.5, y1: 5.8, x2: 64.8, y2: 26 }, duration: 0.5 });
            gsap.to(line2, { attr: { x1: 22.5, y1: 26, x2: 43, y2: 5.5 }, duration: 0.5 });
            gsap.to(line3, { attr: { x1: 43.4, y1: 5.6, x2: 43.4, y2: 60.9 }, duration: 0.5 });
            gsap.to(hamburgerSVG, { backgroundColor: '#F0F8FF', stroke: '#000000', duration: 0.5 });
            gsap.to(sectionContainer, { borderWidth: '0.1vw', height: '100%', duration: 0.5 });
            hambugerDiv.classList.add("clicked");
            document.addEventListener('click', handleClickOutside);
            isToggled = true;
        }
    }

    function handleClickOutside(event) {
        if (isToggled && !hambugerDiv.contains(event.target)) {
            toggleMenu(true);
        }
    }

    document.querySelector(".container-mobile-top-left").addEventListener('click', function (event) {
        event.stopPropagation();
        toggleMenu();
    });

}

function getQuote() {
    const quoteP = document.querySelector(".quote");
    const quoteCredit = document.querySelector(".quote-credit");
    const QuoteIndex = Math.floor(Math.random() * quotes.length);
    quoteP.innerHTML = quotes[QuoteIndex].quote;
    quoteCredit.innerHTML = "\u2014\u0020" + (quotes[QuoteIndex].credit === "" ? "Anonymous" : quotes[QuoteIndex].credit);

    const text = new SplitType('.quote', { types: 'lines' });
    const credit = new SplitType('.quote-credit', { types: "char", charClass: "credit-char" });
    document.querySelectorAll(".line").forEach(eachline => {
        eachline.innerHTML += "<div class='line-mask'></div>";
        let lineMask = eachline.querySelector(".line-mask");
        let qtl = gsap.timeline({
            scrollTrigger: {
                trigger: lineMask,
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });
        qtl.to(lineMask, { width: "0%", duration: 1 });
    });
    var qctl = gsap.timeline({
        scrollTrigger: {
            trigger: ".quote-credit",
            start: "top center",
            end: "bottom center",
            scrub: true
        }
    });
    const creditChars = document.querySelectorAll(".quote-credit .credit-char");

    const creditCharsArray = Array.from(creditChars).slice(1);

    qctl.from(creditChars[0], { xPercent: -60, opacity: 0, scaleX: 0 });

    qctl.from(creditCharsArray, {
        yPercent: 60,
        opacity: 0,
        stagger: 0.1
    });
}

var activeContainerSection = "Upcoming Events";
const swiperContainer = document.querySelector(".container");
const secSVGConatiner = document.querySelector(".section-svgcontainer");
const containerTopRight = document.querySelector(".container-top-right");
var activeSVG = secSVGConatiner.querySelector("#annocument-svg");
const mobileDisplayer = swiperContainer.querySelector(".show-active-btn");
containerfunction(upcomingEventList, "As per now there is no upcoming event", 60, 20, 1);

document.querySelectorAll(".container-top-left").forEach(function (containerbtn) {
    containerbtn.addEventListener("click", (e) => {
        if (e.target.innerHTML != activeContainerSection) {

            //Displaying InnerText of Section button on mobiledisplayer
            mobileDisplayer.innerHTML = `${e.target.innerHTML}`;

            // Removing active staus from older btn
            e.target.parentNode.querySelector(".active").classList.remove("active");
            if (containerTopRight.querySelector(".active")) {
                const activeDisplaybtn = containerTopRight.querySelector(".active");
                containerTopRight.querySelector(".active").classList.remove("active");
            }

            //Removing active staus from svg element
            secSVGConatiner.querySelector(".active").classList.remove("active");

            var stl = gsap.timeline();
            stl.to(".e-card", {
                xPercent: 0,
                yPercent: 1,
                opacity: 0
            });
            stl.to(".no-new-event-div, .main-slide", {
                opacity: 0,
                onEnter: () => {
                    if (e.target.innerHTML == "Upcoming Events") {
                        activeSVG = secSVGConatiner.querySelector("#annocument-svg");
                        const activeDisplaybtn = swiperContainer.querySelector("#new-event");
                        activeDisplaybtn.classList.add("active");
                        activeSVG.classList.add("active");
                        containerfunction(upcomingEventList, "As per now there is no upcoming event", 60, 20, 1);

                    } else if (e.target.innerHTML == "Recent Events") {
                        activeSVG = secSVGConatiner.querySelector("#recent-svg");
                        activeSVG.classList.add("active");
                        containerfunction(recentEventList, "", 30, 20, 2);

                    } else if (e.target.innerHTML == "Ongoing Series") {
                        activeSVG = secSVGConatiner.querySelector("#ongoing-svg");
                        const activeDisplaybtn = swiperContainer.querySelector("#volunteer-btn");
                        activeSVG.classList.add("active");
                        activeDisplaybtn.classList.add("active");
                        containerfunction(onGoingSeriesList, "Currently No Series is going", 30, 20, 3);

                    };
                }
            }
            );

            stl.from(".e-card", {
                yPercent: 1,
                opacity: 1,
                stagger: 0.1
            });
            e.target.classList.add("active");
            activeContainerSection = e.target.innerHTML;
        }
    })
})

getQuote();
addingImagesToRecentImages();
addingConvenersinfo();
addingVolunters();
addingGoogleFormLinks();
addingSeriesToFooter();
containerBtnForMobile();

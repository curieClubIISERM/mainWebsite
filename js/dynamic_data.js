import { quotes } from "../data_lists/quotes_data.js";
import { coordinators } from "../data_lists/coordinators_data.js";
import { googleFormLinks } from "../data_lists/google_forms.js";
import { images } from "../data_lists/recent_event_memories.js";
import { formatStudentInfo, extractDateFromISO } from "./utility.js";
var SeriesList = [];
var upcomingEventList = [];
var recentEventList = [];

fetch('https://script.google.com/macros/s/AKfycbyC8x81QyF0vcU0KAHFN2c9OyNaBpsyAM7_062qjrAG0nyjsmMUhwrS9e4sZjnmgz9KQg/exec')
    .then(response => response.json())
    .then(data => {
        // Process Volunteers
        addingVolunteersName(data.volunteers);

        // Process Series
        SeriesList = data.series;
        addingSeriesToFooter(SeriesList);

        // Process Events
        const allRecentEvents = data.events.recentEvents;
        const allUpcomingEvents = data.events.upcomingEvents;
        // Use processEvents to determine currently happening events
        const { recentEvents, upcomingEvents } = processEvents(allRecentEvents);

        // Update global lists
        recentEventList = recentEvents;
        upcomingEventList = [...upcomingEvents, ...allUpcomingEvents]

        // Use updated lists to display events
        addEvents();
    })
    .catch(error => console.error('Error:', error));



const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

function processEvents(events) {
    const currentTime = new Date(); // Current time
    const recentEvents = [];
    const upcomingEvents = [];

    events.forEach(event => {
        const eventDate = new Date(event["Event Date"]); // Parse the event date
        const eventTime = event["Event Time"];
        const durationStr = event["Probably Event Duration "];

        // Parse event time into hours and minutes
        const [hours, minutes] = eventTime.split(':');
        const period = eventTime.split(' ')[1]; // AM or PM
        let eventHours = parseInt(hours);
        if (period === 'PM' && eventHours !== 12) eventHours += 12;
        if (period === 'AM' && eventHours === 12) eventHours = 0;

        // Set the event start time
        eventDate.setHours(eventHours, parseInt(minutes), 0);

        // Calculate the event's end time using the duration
        const [durationHours, durationMinutes] = durationStr.split(':').map(Number);
        const eventEndTime = new Date(eventDate);
        eventEndTime.setHours(eventDate.getHours() + durationHours, eventDate.getMinutes() + durationMinutes);

        // Check the event's current status
        if (currentTime >= eventDate && currentTime <= eventEndTime) {
            // Event is currently happening
            event.status = "currently happening";
            upcomingEvents.unshift(event);
        } else if (currentTime > eventEndTime) {
            // Event has ended
            recentEvents.push(event);
        } else {
            // Event is in the future
            upcomingEvents.push(event);
        }
    });

    return { recentEvents, upcomingEvents };
}

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
    const container = document.querySelector('.coordinator-info-container');

    coordinators.forEach(coordinator => {
        const card = document.createElement('div');
        card.className = 'coord-info-cards';

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
        positionDiv.className = 'coord-position';
        positionDiv.textContent = coordinator.position;
        card.appendChild(positionDiv);

        container.appendChild(card);
    });

    const heading = document.createElement('h2');
    heading.className = 'coordinator-heading';
    heading.textContent = 'Current Conveners';
    container.appendChild(heading);
}

function addingVolunteersName(data) {
    const volunteersDiv = document.querySelector("#volunteers");
    const thanksCurser = document.getElementById("thanks-curser");
    data.slice(0, 12).forEach(person => {
        const personDiv = document.createElement('div');
        personDiv.className = 'thanks-person';
        personDiv.textContent = formatStudentInfo(person);
        personDiv.onmouseenter = () => {
            gsap.to(thanksCurser, { scale: 1 });
        };
        personDiv.onmouseleave = () => {
            gsap.to(thanksCurser, { scale: 0.5 });
        };
        volunteersDiv.appendChild(personDiv);
    });    
}

function addingGoogleFormLinks() {
    for (let googleLink of googleFormLinks) {
        document.querySelector(".google-forms .footer-links-container").innerHTML += `<a href="${googleLink.link}">${googleLink.text}</a>`
    }
}

// Update display-btn link
function updatedDisplayBtnLink() {
    const volunteerLink = googleFormLinks.find(item => item.type === "Volunteering").link;
    const proposalLink = googleFormLinks.find(item => item.type === "Proposing Event").link;

    document.getElementById("volunteer-btn").onclick = function () {
        window.location.href = volunteerLink;
    };

    document.getElementById("new-event").onclick = function () {
        window.location.href = proposalLink;
    };
}

function addingSeriesToFooter(SeriesDetails) {
    for (let series of SeriesDetails) {
        document.querySelector(".series .footer-links-container").innerHTML += `<a href="${series["Link"]}">${series["Series Name"]}</a>`
    }
}

function getQuote() {
    const quoteP = document.querySelector(".quote");
    const quoteCredit = document.querySelector(".quote-credit");
    const QuoteIndex = Math.floor(Math.random() * quotes.length);
    quoteP.innerHTML = quotes[QuoteIndex].quote;
    quoteCredit.innerHTML = "\u2014\u0020" + (quotes[QuoteIndex].credit === "" ? "Anonymous" : quotes[QuoteIndex].credit);

    const text = new SplitType('.quote', { types: 'lines' });
    const credit = new SplitType('.quote-credit', { types: "char", charClass: "credit-char" });
    document.querySelectorAll(".line").forEach(eachLine => {
        eachLine.innerHTML += "<div class='line-mask'></div>";
        let lineMask = eachLine.querySelector(".line-mask");
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

function addEvents() {
    var activeContainerSection = "Upcoming Events";
    const swiperContainer = document.querySelector(".container");
    const prevBtn = swiperContainer.querySelector(".swiper-button-prev");
    const swiperDiv = swiperContainer.querySelector(".swiper")
    const swiperWrapper = swiperContainer.querySelector(".swiper-wrapper");
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
    const secSVGContainer = document.querySelector(".section-svg-container");
    const containerTopRight = document.querySelector(".container-top-right");
    var activeSVG = secSVGContainer.querySelector("#announcement-svg");
    const mobileDisplay = swiperContainer.querySelector(".show-active-btn");
    gsap.set("#new-event", { opacity: 1 })
    containerFunction(upcomingEventList, "As per now there is no upcoming event", 60, 20, 1);

    function containerFunction(eventList, NoEventString, onDisableTranslation, onEnableTranslation, style) {
        //Removing old Slides
        swiperWrapper.querySelectorAll(".main-slide").forEach(card => {
            swiperWrapper.removeChild(card);
        })

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
                let overlayDiv = document.createElement("div");

                let cardTitle = document.createElement("h2");
                let eventType = document.createElement("h3");

                let anchorTag = document.createElement("a");

                let cardDescription = document.createElement("p");
                let cardDate = document.createElement("p");
                let cardTime = document.createElement("p");
                let cardVenue = document.createElement("p");

                //Adding Classes
                swiperSlide.className = "swiper-slide main-slide";
                card.className = "e-card playing";
                // card.style.transitionDelay = `${index / 20}s`;
                if (style == 1) {
                    // Styling Event Card

                    //Adding TextContent
                    cardTitle.textContent = event["Event Name"];

                    //Adding Classes
                    cardContent.className = "e-card-content";
                    cardTitle.className = "e-card-title";
                    eventDetailsDiv.className = "e-details";
                    overlayDiv.className = "e-overlay";
                    cardDate.className = "e-card-date";
                    cardTime.className = "e-card-time";
                    cardVenue.className = "e-card-venue";
                    cardDescription.className = "e-card-description";

                    //Forming DOM
                    cardContent.appendChild(cardTitle);
                    if (event["Event Date"]) {
                        cardDate.innerHTML = `<i class="fa-regular fa-calendar-days"></i><span>Date: </span><span>${extractDateFromISO(event["Event Date"])}</span>`;
                        eventDetailsDiv.appendChild(cardDate);
                    };

                    //Adding Time info
                    if (event["Event Time"]) {
                        cardTime.innerHTML = `<i class="fa-regular fa-clock"></i><span>Time: </span><span>${event["Event Time"]}</span>`;
                        eventDetailsDiv.appendChild(cardTime);
                    };

                    //Adding Venue info
                    if (event["Event Venue"]) {
                        cardVenue.innerHTML = `<i class="fa-solid fa-location-dot"></i><span>Venue: </span><span>${event["Event Venue"]}</span>`;
                        eventDetailsDiv.appendChild(cardVenue);
                    }

                    //Adding Description
                    if (event["Event Description"]) {
                        cardDescription.textContent = event["Event Description"];
                        eventDetailsDiv.appendChild(cardDescription);
                        cardContent.appendChild(eventDetailsDiv);
                        cardContent.appendChild(overlayDiv);
                    }

                    //Adding Status 
                    if (event.status) {
                        eventDetailsDiv.className += " happening"
                    }

                    eventDetailsDiv.appendChild(cardDescription);
                    cardContent.appendChild(eventDetailsDiv);
                    cardContent.appendChild(overlayDiv);

                }

                if (style == 2) {
                    // Styling Recent Cards

                    //Adding Classes
                    cardContent.className = "r-card-content";
                    eventType.className = "r-card-type";
                    eventDetailsDiv.className = "r-details";
                    cardTitle.className = "r-card-title";
                    overlayDiv.className = "r-card-overlay";
                    cardDescription.className = "r-card-description";

                    // Forming DOM
                    cardContent.appendChild(eventType);
                    eventDetailsDiv.appendChild(cardTitle)

                    //Adding Description
                    if (event["Event Description"]) {
                        cardDescription.textContent = event["Event Description"];
                        eventDetailsDiv.appendChild(cardDescription);
                        cardContent.appendChild(eventDetailsDiv);
                        cardContent.appendChild(overlayDiv);
                    }

                    // Adding TextContent
                    eventType.textContent = event["Event Type"];
                    cardTitle.textContent = event["Event Name"];

                }

                if (style == 3) {
                    // Styling Series Card

                    // Adding Classes
                    cardContent.className = "s-card-content";
                    cardTitle.className = "s-card-tittle";
                    eventDetailsDiv.className = "s-details";
                    btnDiv.className = "s-btn"
                    cardDescription.className = "s-card-description";
                    anchorTag.className = "s-btn"

                    // Forming DOM
                    cardContent.appendChild(cardTitle);
                    eventDetailsDiv.appendChild(cardDescription);
                    btnDiv.appendChild(anchorTag);
                    eventDetailsDiv.appendChild(btnDiv);
                    cardContent.appendChild(eventDetailsDiv)

                    // Adding TextContent
                    anchorTag.textContent = "Check Out"

                    cardTitle.textContent = event["Series Name"];
                    cardDescription.textContent = event["Description"];
                    cardDescription.style.webkitLineClamp = event["Line Clamp"]
                    anchorTag.setAttribute("href", event["Link"]);
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

                var tl = gsap.timeline();
                tl.set(swiperSlide, { opacity: 0, yPercent: 2 })
                tl.to(swiperSlide, { opacity: 1, yPercent: 0, delay: 0.3 * index })

                //Appending Swiper Slide to Body
                swiperWrapper.appendChild(swiperSlide);

                index = index + 1;
            }
        } else {
            let swiperSlide = document.createElement("div");
            let noNewEventDiv = document.createElement("div");
            let noNewEvent = document.createElement("div");

            swiperSlide.className = "swiper-slide main-slide";
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
        swiper.update();
        swiper.slideTo(0, 0);

        //Defining SVG animation
        function containerSVGAnimation() {
            if (prevBtn.classList.contains("swiper-button-disabled")) {
                gsap.to(secSVGContainer, { transform: `translate(${onDisableTranslation}%)` })
            } else {
                gsap.to(secSVGContainer, { transform: `translate(${onEnableTranslation}%)` })
            }
        }

        gsap.to(secSVGContainer, { transform: `translate(${onEnableTranslation}%)` })

        //Applying SVG animation
        swiperDiv.onclick = containerSVGAnimation;
        swiperDiv.onmousemove = containerSVGAnimation;
        swiper.onslidechange = containerSVGAnimation;

    }

    function containerBtnForMobile() {
        const hamburgerDiv = swiperContainer.querySelector('.hamburger');
        let isToggled = false;

        function toggleMenu(close = false) {
            const hamburgerSVG = hamburgerDiv.querySelector('svg');
            const sectionContainer = swiperContainer.querySelector(".container-top-left");
            const line1 = hamburgerDiv.querySelector("#line1");
            const line2 = hamburgerDiv.querySelector("#line2");
            const line3 = hamburgerDiv.querySelector("#line3");

            if (isToggled || close) {
                gsap.to(line1, { attr: { x1: 5, y1: 5, x2: 79.5, y2: 5 }, duration: 0.5 });
                gsap.to(line2, { attr: { x1: 5, y1: 32, x2: 60.5, y2: 32 }, duration: 0.5 });
                gsap.to(line3, { attr: { x1: 5, y1: 59, x2: 32.5, y2: 59 }, duration: 0.5 });
                gsap.to(sectionContainer, { borderWidth: '0vw', height: '0%', duration: 0.5 });
                gsap.to(hamburgerSVG, { backgroundColor: '#000000', stroke: '#F0F8FF', duration: 0.5 });
                hamburgerDiv.classList.remove("clicked");
                document.removeEventListener('click', handleClickOutside);
                isToggled = false;
            } else {
                gsap.to(line1, { attr: { x1: 44.5, y1: 5.8, x2: 64.8, y2: 26 }, duration: 0.5 });
                gsap.to(line2, { attr: { x1: 22.5, y1: 26, x2: 43, y2: 5.5 }, duration: 0.5 });
                gsap.to(line3, { attr: { x1: 43.4, y1: 5.6, x2: 43.4, y2: 60.9 }, duration: 0.5 });
                gsap.to(hamburgerSVG, { backgroundColor: '#F0F8FF', stroke: '#000000', duration: 0.5 });
                gsap.to(sectionContainer, { borderWidth: '0.1vw', height: '100%', duration: 0.5 });
                hamburgerDiv.classList.add("clicked");
                document.addEventListener('click', handleClickOutside);
                isToggled = true;
            }
        }

        function handleClickOutside(event) {
            if (isToggled && !hamburgerDiv.contains(event.target)) {
                toggleMenu(true);
            }
        }

        document.querySelector(".container-mobile-top-left").addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMenu();
        });

    }

    document.querySelectorAll(".container-top-left").forEach(function (containerBtn) {
        containerBtn.addEventListener("click", (e) => {
            if (e.target.innerHTML != activeContainerSection) {

                //Displaying InnerText of Section button on mobileDisplay
                mobileDisplay.innerHTML = `${e.target.innerHTML}`;

                // Removing active status from older btn
                e.target.parentNode.querySelector(".active").classList.remove("active");
                if (containerTopRight.querySelector(".active")) {
                    const activeDisplayBtn = containerTopRight.querySelector(".active");
                    gsap.to(activeDisplayBtn, {
                        opacity: 0,
                        onComplete: () => {
                            activeDisplayBtn.classList.remove("active");
                        }
                    })

                }

                //Removing active status from svg element
                secSVGContainer.querySelector(".active").classList.remove("active");

                var stl = gsap.timeline();

                stl.to(".main-slide", {
                    xPercent: 0,
                    yPercent: 1,
                    opacity: 0,
                    stagger: 0.1,
                    onComplete: () => {
                        if (e.target.innerHTML == "Upcoming Events") {
                            activeSVG = secSVGContainer.querySelector("#announcement-svg");
                            const activeDisplayBtn = swiperContainer.querySelector("#new-event");
                            gsap.to(activeDisplayBtn, {
                                opacity: 1,
                                onStart: () => {
                                    activeDisplayBtn.classList.add("active");
                                }
                            })
                            activeSVG.classList.add("active");
                            containerFunction(upcomingEventList, "As per now there is no upcoming event", 60, 20, 1);

                        } else if (e.target.innerHTML == "Recent Events") {
                            activeSVG = secSVGContainer.querySelector("#recent-svg");
                            activeSVG.classList.add("active");
                            containerFunction(recentEventList, "", 30, 20, 2);

                        } else if (e.target.innerHTML == "Ongoing Series") {
                            activeSVG = secSVGContainer.querySelector("#ongoing-svg");
                            const activeDisplayBtn = swiperContainer.querySelector("#volunteer-btn");
                            activeSVG.classList.add("active");
                            gsap.to(activeDisplayBtn, {
                                opacity: 1,
                                onStart: () => {
                                    activeDisplayBtn.classList.add("active");
                                }
                            })
                            containerFunction(SeriesList, "Currently No Series is going", 30, 20, 3);

                        };
                    }
                }
                );
                e.target.classList.add("active");
                activeContainerSection = e.target.innerHTML;
            }
        })
    })
    containerBtnForMobile();
}

updatedDisplayBtnLink()
getQuote();
addingImagesToRecentImages();
addingConvenersinfo();
addingGoogleFormLinks();


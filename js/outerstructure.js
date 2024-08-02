document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.querySelector('.theme-switch__checkbox');
    
    // Check if there's a stored theme preference in local storage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        document.documentElement.classList.toggle('dark-mode', storedTheme === 'dark');
        checkbox.checked = storedTheme === 'dark';
    }
    
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark'); // Store theme preference in local storage
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light'); // Store theme preference in local storage
        }
    });
});



//Animation for testtube based onn scrolling
document.addEventListener('mouseover', function(event) {
    var hoveredElement = event.target;
    var liquid = document.getElementById('chemical');
    var bubbles = document.getElementsByClassName('bubble');
    const maxfill = 185;
    console.log('mouseoverfunction works', hoveredElement);

    // Check if the hovered element has the "image-slide" class
    if ((hoveredElement.classList.contains('image-slide'))) {
        hoveredElement = document.getElementsByClassName('slideshow-container display visible')[0];
    }
    hoveredElement.addEventListener('scroll', function() {
        console.log("mousescroll function works")
        var scrolled = hoveredElement.scrollTop;
        var totalHeight = hoveredElement.scrollHeight - hoveredElement.clientHeight;
        var scrollratio = (scrolled / totalHeight);

        var chemicalheight = (1 - scrollratio) * maxfill;
        var vArgument = 'V' + chemicalheight.toString();
        
        // Get the current 'd' attribute value
        var pathData = liquid.getAttribute('d');
        var pathCommands = pathData.split(/\s+|,/);
        
        // Update the V argument (assuming it's the 12th element in the array)
        pathCommands[13] = vArgument; // Change the V argument to 200

        // Join the updated commands and parameters back into a string
        var newPathData = pathCommands.join(' ');

        // Set the updated 'd' attribute value back to the path element
        liquid.setAttribute('d', newPathData);

        // Change initial position of bubble elements
        var maxcx = 190;
        var newcx = maxcx * (1 - scrollratio);
        for (var i = 0; i < bubbles.length; i++) {
            // Change the cx attribute value for each bubble
            bubbles[i].setAttribute("cy", newcx);
        
        }
    });
});

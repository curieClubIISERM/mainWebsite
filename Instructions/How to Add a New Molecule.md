## How to Add a New Molecule

### Step 1: Uploading Images of the Molecule
1. **Navigate to the Directory:**
   - Go to the `assets/MOTW/` directory in your project.
2. **Create a Folder:**
   - Create a new directory named after the molecule (e.g., `Artemisinin`).
3. **Upload Images:**
   - Upload the images of the molecule to the newly created folder. Ensure the images are in `.webp` format for faster loading. You can use an online converter to change the format to `.webp` if needed.

### Step 2: Uploading the PDF of the Molecule
1. **Upload the PDF:**
   - Upload the PDF document related to the molecule to Google Drive.
2. **Set Sharing to Public:**
   - Change the sharing settings of the PDF to "Public" so that it can be accessed by anyone with the link.
3. **Copy the Link:**
   - Copy the shareable link to be used later in the JavaScript object.

### Step 3: Fill in the JavaScript Object
1. **Locate the Object:**
   - Open the JavaScript file located at `data_lists/MOTW-data.js`.
2. **Specify Slide Addresses:**
   - Ensure the slide images are properly addressed in the `slides` section. The slide addresses should follow this format:
     - `../assets/MOTW/MoleculeName/1.webp`
   - Replace `MoleculeName` with the actual name of the molecule and adjust the image number (`1.webp`, `2.webp`, etc.) according to the files you've uploaded.

3. **Add Molecule Data:**
   - Use the following structure to add the new molecule to the `molecules` object. Replace the placeholders with actual data.

```javascript
/* MOLECULE NAME IN CAMEL CASE */: {
    moleculeName: /* 'MOLECULE NAME IN NORMAL CASE' */, // e.g., 'Artemisinin'
    publishDate: /* 'YYYY-MM-DD' */, // e.g., '2024-04-06'
    publishTime: /* 'HH:MM' */, // e.g., '09:30'
    credits: {
        Writer: /* 'WRITER NAME' */, // e.g., 'John Doe (MS24)'
        Designer: /* 'DESIGNER NAME' */, // e.g., 'Jane Smith (MS24)'
        Editor: /* 'EDITOR NAME' */ // Optional: Leave empty if not applicable
    },
    slides: {
        slide1: /* '../assets/MOTW/MoleculeName/1.webp' */, // e.g., '../assets/MOTW/Artemisinin/1.webp'
        slide2: /* '../assets/MOTW/MoleculeName/2.webp' */, // Optional: Add as needed
        // Add more slides as needed (slide3, slide4, etc.)
    },
    pdflink: drive.toDownload(/* 'PDF LINK' */), // e.g., 'https://drive.google.com/uc?export=download&id=13Vd5BlfiRxo2YTLm1N5Wjer_BxFieDih'
    references: [
        { linkTitle: /* 'REFERENCE 1 TITLE' */, link: /* 'REFERENCE 1 LINK' */ },
        { linkTitle: /* 'REFERENCE 2 TITLE' */, link: /* 'REFERENCE 2 LINK' */ }, // Add more references as needed
    ]
}
```

### Step 4: Example of a Molecule Entry

```javascript
geosmin: {
    moleculeName: "Geosmin",
    publishDate: "2024-04-06",
    publishTime: "09:30",
    credits: {
        Writer: "M Srinivas (MS22)",
        Designer: "Dibyendu Sarkar (MS22)",
        Editor: "Dibyendu Sarker (MS22)"
    },
    slides: {
        slide1: "../assets/MOTW/Geosmin/1.webp",
        slide2: "../assets/MOTW/Geosmin/2.webp",
        slide3: "../assets/MOTW/Geosmin/3.webp",
        slide4: "../assets/MOTW/Geosmin/4.webp",
        slide5: "../assets/MOTW/Geosmin/5.webp",
        slide6: "../assets/MOTW/Geosmin/6.webp",
    },
    pdflink: drive.toDownload("https://drive.google.com/file/d/13Vd5BlfiRxo2YTLm1N5Wjer_BxFieDih/view?usp=drive_link"),
    references: [
        { linkTitle: "Geosmin Overview - Wikipedia", link: "https://en.wikipedia.org/wiki/Geosmin" },
        { linkTitle: "Geosmin - Molecule of the Week - ACS", link: "https://www.acs.org/molecule-of-the-week/archive/g/geosmin.html" }
    ]
},
```

### Final Step: Add the Molecule to the JS File
1. **Open the Data File:**
   - Go to `data_lists/MOTW-data.js`.
2. **Add the Molecule Object:**
   - Insert the new molecule object you created into the `molecules` object in the appropriate place, maintaining alphabetical order if necessary.

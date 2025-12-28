## How to Add a New Molecule

> ⚠️ **Important Note on Naming & Case Sensitivity**  
> This project is **case-sensitive**. Please follow the naming rules carefully to avoid broken links or missing data.

---

### Step 1: Uploading Images of the Molecule
1. **Navigate to the Directory:**
   - Go to the `assets/MOTW/` directory in your project.
2. **Create a Folder (camelCase only)**
   - Create a new folder named after the molecule using **camelCase**.
   - **Examples:**
     - `isoamylAcetate`
     - `dendriticFibrousNanosilica`
     - `caffeine`

   > The folder name **must exactly match** the molecule key used in the JavaScript file.
3. **Upload Images:**
   - Upload the molecule images inside this folder.
   - Images **must be in `.webp` format** for optimal performance.
   - Name the images sequentially: `1.webp`, `2.webp`, `3.webp`, etc.

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
2. **Use camelCase for the Molecule Key**
   - The **object key must be in camelCase**.
   - This key must **exactly match** the folder name created in `assets/MOTW/`.

   **Example:**
   ```js
   isoamylAcetate: { ... }
 3. **Specify Slide Addresses:**
   - Ensure the slide images are properly addressed in the `slides` section. The slide addresses should follow this format:
     - `../assets/MOTW/MoleculeName/1.webp`
   - Replace `MoleculeName` with the actual name of the molecule (in Camel Case) and adjust the image number (`1.webp`, `2.webp`, etc.) according to the files you've uploaded.
   - Here "../" is required thing, donot forgot to add it.

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
prussianBlue: {
        moleculeName: "Prussian Blue",
        publishDate: "2025-12-14",
        publishTime: "11:00",
        credits: {
            Writer: "Aviral Singh (MS25)",
            Designer: "Prince Nimiwal (MS24)",
            Editor: "Garima Saini (MS24)"
        },
        slides: {
            slide1: "../assests/MOTW/PrussianBlue/1.webp",
            slide2: "../assests/MOTW/PrussianBlue/2.webp",
            slide3: "../assests/MOTW/PrussianBlue/3.webp",
            slide4: "../assests/MOTW/PrussianBlue/4.webp",
            slide5: "../assests/MOTW/PrussianBlue/5.webp",
            slide6: "../assests/MOTW/PrussianBlue/6.webp",
            slide7: "../assests/MOTW/PrussianBlue/7.webp",
            slide8: "../assests/MOTW/PrussianBlue/8.webp",
            slide9: "../assests/MOTW/PrussianBlue/9.webp",
            slide10: "../assests/MOTW/PrussianBlue/10.webp",
            slide11: "../assests/MOTW/PrussianBlue/11.webp",
        },
        pdfLink: drive.toDownload("https://drive.google.com/file/d/1SCUMQ6Tt9PwtviFL8dO5wlSB3rCuwVsq/view?usp=sharing"),

        "references": [
            { "linkTitle": "Britannica", "link": "https://www.britannica.com/technology/Prussian-blue" },
            { "linkTitle": "ACS-Chemistry of Life", "link": "https://www.acs.org/molecule-of-the-week/archive/p/prussian-blue.html" },
            { "linkTitle": "LibreTexts-Chemistry", "link": "https://chem.libretexts.org/Bookshelves/Inorganic_Chemistry/Inorganic_Chemistry_(LibreTexts)/09%3A_Coordination_Chemistry_I_-_Structure_and_Isomers/9.02%3A_History " },]
    },
```

### Final Step: Add the Molecule to the JS File
1. **Open the Data File:**
   - Go to `data_lists/MOTW-data.js`.
2. **Add the Molecule Object:**
   - Insert the new molecule object you created into the `molecules` object in the appropriate place, maintaining alphabetical order if necessary.

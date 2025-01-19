# How to Add Events, Series Data, and Event Memories

## Adding Event Details

1. **Locate the Google Sheet:**
   - Open the Google Sheet linked to the Curie Club website. The link should be shared with authorized users.

2. **Add the Event Data:**
   - Navigate to the `Event Detail` tab in the Google Sheet.
   - Use the following format to fill in the event details in a horizontal manner:

| **Event Type** | **Event Name**    | **Event Date** | **Event Time** | **Probably Event Duration** | **Event Venue** | **Event Description** |
|----------------|-------------------|----------------|----------------|-----------------------------|-----------------|------------------------|
| Talk           | Student's Talk    | 2025-01-20     | 01:00 AM       | 02:00                      | LH5 / LH6       | An engaging session where students will present their research and ideas, fostering knowledge sharing and collaboration.             |

 - **Important:** Ensure that the **Event Type** field is never left empty. If no specific type is available, please enter at least a space to keep the field filled.

3. **Save Changes:**
   - Once you have updated the sheet, the data will automatically reflect on the website via the integrated Google Apps Script.

---

## Adding Ongoing Series

1. **Locate the Google Sheet:**
   - Open the Google Sheet linked to the Curie Club website.

2. **Add the Series Data:**
   - Navigate to the `Series Detail` tab in the Google Sheet.
   - Use the following format to fill in the series details in a horizontal manner:

| **Series Name**       | **Series Description**                            | **Link**                          | **Line Clamp** |
|-----------------------|--------------------------------------------------|-----------------------------------|----------------|
| Molecule Of The Week  | Explore a new molecule and its significance weekly.| htmls/molecule-of-the-week.html   | 3              |

3. **Save Changes:**
   - Once you have updated the sheet, the data will automatically reflect on the website.

---

## Adding Recent Event Memories

### Uploading Images for Recent Event Memories

1. **Locate the Assets Folder:**
   - Navigate to the `assets/events_images/` directory.

2. **Upload the Image:**
   - Upload the image file related to the recent event. Ensure that the image is in `.webp` format to optimize loading times. You can use any online converter to change the image format to `.webp` if necessary.

3. **Naming the Image File:**
   - Name the image file appropriately, reflecting the event name or a brief description (e.g., `INST_lab_tour.webp`).

### Adding the Event Memory Image

1. **Locate the Data File:**
   - Open the JavaScript file located at `data_lists/recent_event_memories.js`.

2. **Add the Event Memory Image:**
   - Use the following structure to add a new image to the `images` object. Replace the placeholders with the actual image details.

```javascript
images: [
    {
        src: /* 'IMAGE SOURCE' */, // e.g., 'assets/events_images/INST_lab_tour.webp'
        alt: /* 'ALT TEXT' */ // e.g., 'INST Lab Tour'
    },
    // Add more images here as needed
]
```

### Example of a Recent Event Memory Entry

```javascript
images: [
    {
        src: "assets/events_images/INST_lab_tour.webp",
        alt: "INST Lab Tour"
    }
]
```


# How to Manage Quotes

## Adding or Updating Quotes

1. **Locate the Data File:**
   - Open the JavaScript file located at `data_lists/quotes_data.js`.

2. **Modify the Quotes Array:**
   - You can add new quotes or update existing ones in the `quotes` array. Each quote object should include a `quote` field for the quote text and a `credit` field for the attribution. If a quote does not have a specific credit, the `credit` field can be left empty.

### Adding a New Quote

- To add a new quote, append a new object to the `quotes` array with the following structure:

```javascript
{
    "quote": /* 'QUOTE TEXT' */, // e.g., "Chemistry is the science of matter, but I prefer to think of it as the science of how matter is connected."
    "credit": /* 'CREDIT' */ // e.g., "Anonymous" (Leave empty if no credit)
}
```

### Example of Adding a New Quote

```javascript
export const quotes = [
    // Existing quotes here...

    {
        "quote": "Chemistry is the science of matter, but I prefer to think of it as the science of how matter is connected.",
        "credit": "Anonymous"
    }
];
```

### Updating an Existing Quote

- To update an existing quote, find the object with the quote you want to change and modify the `quote` or `credit` fields as needed.

### Example of Updating a Quote

```javascript
export const quotes = [
    {
        "quote": "Chemistry can be a good and bad thing. Chemistry is good when you make love with it. Chemistry is bad when you make crack with it.",
        "credit": "Adam Sandler"
    },
    // Other existing quotes...

    {
        "quote": "Life is chemistry; dilute your sorrow evaporate your worries filter your mistake boil your ego 'You will get the crystal of happiness'",
        "credit": "" // No credit for this quote
    }
];
```

## Important Notes:
- Ensure that each `quote` text is correctly enclosed in quotation marks.
- The `credit` field can be left empty if no specific attribution is available.
- Maintain consistency in the formatting and structure of the quotes array to ensure proper functionality.
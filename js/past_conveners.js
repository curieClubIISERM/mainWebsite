import { conveners } from "../data_lists/past_conveners_data.js";

const tableContainer = document.getElementById('convener-table'); // Replace with your actual container ID

// Create the table element
const table = document.createElement('table');
table.border = '1';

// Create the table header
const header = table.createTHead();
const headerRow = header.insertRow(0);
const headers = ['Years', 'Convener', 'Co-Convener 1', 'Co-Convener 2'];

headers.forEach((headerText, index) => {
  const cell = headerRow.insertCell(index);
  cell.outerHTML = `<th>${headerText}</th>`;
});

// Create the table body
const tbody = table.createTBody();

conveners.forEach(entry => {
  const row = tbody.insertRow();
  row.insertCell().textContent = entry.years;
  row.insertCell().textContent = entry.convener;
  row.insertCell().textContent = entry.co_convener1;
  row.insertCell().textContent = entry.co_convener2;
});

tableContainer.appendChild(table);
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Utility: slugify description for future use (not currently used, but handy)
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-') // Replace spaces/non-word chars with hyphens
      .replace(/^-+|-+$/g, ''); // Remove trailing hyphens
  }

  // Extract section letter from filename (e.g., index-a.html → 'a')
  const match = window.location.pathname.match(/index-([a-z])\.html/i);
  const sectionLetter = match ? match[1] : 'a'; // default to 'a' if unmatched
  const folderName = `section-${sectionLetter}`;

  // Add exhibit number and file path
  data.forEach((item, index) => {
    item.exhibitNo = String(index + 1).padStart(3, '0');
    item.filePath = `files/${folderName}/${sectionLetter}-${item.exhibitNo}.pdf`;
  });

  const tableBody = document.getElementById('table-body');
  const categorySelect = document.getElementById('category-select');
  let currentSort = { column: 'date', ascending: true };

  function populateCategories() {
    const categories = Array.from(new Set(data.map(d => d.category))).sort();
    categorySelect.innerHTML = '<option value="All">All</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  function renderTable() {
    tableBody.innerHTML = '';
    let filteredData = categorySelect.value === 'All'
      ? data
      : data.filter(d => d.category === categorySelect.value);

    filteredData.sort((a, b) => {
      const col = currentSort.column;
      let valA = a[col];
      let valB = b[col];

      if (col === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (col === 'exhibitNo') {
        valA = parseInt(valA, 10);
        valB = parseInt(valB, 10);
      } else {
        valA = valA?.toString().toLowerCase();
        valB = valB?.toString().toLowerCase();
      }

      if (valA < valB) return currentSort.ascending ? -1 : 1;
      if (valA > valB) return currentSort.ascending ? 1 : -1;
      return 0;
    });

    filteredData.forEach(item => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${item.exhibitNo}</td>
        <td>${item.category}</td>
        <td>${item.type}</td>
        <td>${item.description}</td>
        <td>${item.date}</td>
        <td>${item.author}</td>
        <td>${item.section}</td>
        <td>${item.media}</td>
        <td><a href="#" class="view-pdf-link" data-pdf-path="${item.filePath}">View</a></td>
        <td><a href="${item.filePath}" download>Download</a></td>
      `;

      tableBody.appendChild(tr);
    });

    // Re-attach view listeners if needed
    attachPdfViewListeners();
  }

  function attachSortListeners() {
    document.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-column');
        if (currentSort.column === col) {
          currentSort.ascending = !currentSort.ascending;
        } else {
          currentSort.column = col;
          currentSort.ascending = true;
        }
        renderTable();
      });
    });
  }

  categorySelect.addEventListener('change', () => {
    renderTable();
  });

  document.getElementById("open-in-tab")?.addEventListener("click", () => {
  viewerTab = window.open("viewer.html", "pdfViewerTab");

  // Send current path after tab loads
  setTimeout(() => {
    if (currentPdfPath && viewerTab) {
      viewerTab.postMessage({ type: "load-pdf", path: currentPdfPath }, "*");
    }
  }, 300);
});


let pdfDoc = null;
let currentPage = 1;
let viewerTab = null;
const canvas = document.getElementById("pdfViewer");
const ctx = canvas?.getContext("2d");
let currentPdfPath = null;

function openPdfDocument(path) {
  currentPdfPath = path;

  if (canvas && ctx) {
    // Inline preview
    pdfjsLib.getDocument(path).promise.then(pdf => {
      pdfDoc = pdf;
      currentPage = 1;
      renderPage(currentPage);
    }).catch(err => {
      console.error("Error loading PDF in canvas:", err);
    });
  }

  if (viewerTab && !viewerTab.closed) {
    viewerTab.postMessage({ type: "load-pdf", path }, "*");
  }
}

function renderPage(num) {
  if (!pdfDoc) return;
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext);
    document.getElementById("page-num").textContent = num;
    document.getElementById("page-count").textContent = pdfDoc.numPages;
  });
}

function attachPdfViewListeners() {
  document.querySelectorAll(".view-pdf-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pdfPath = e.currentTarget.getAttribute("data-pdf-path");
      if (pdfPath) {
        openPdfDocument(pdfPath);
      } else {
        console.warn("No PDF path found.");
      }
    });
  });
}


// Init
  populateCategories();
  attachSortListeners();
  renderTable();
}

);

document.addEventListener('DOMContentLoaded', () => {
  function slugify(text) {
    return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  const match = window.location.pathname.match(/index-([a-z])\.html/i);
  const sectionLetter = match ? match[1] : 'a';
  const folderName = `section-${sectionLetter}`;

  data.forEach((item, index) => {
    item.exhibitNo = String(index + 1).padStart(3, '0');
    item.filePath = `./files/${folderName}/${sectionLetter}-${item.exhibitNo}.pdf`;
  });

  const tableBody = document.getElementById('table-body');
  const categorySelect = document.getElementById('category-select');
  let currentSort = { column: 'date', ascending: true };
  let currentPage = 1;
  const rowsPerPage = 15;

  let filteredData = [...data];

  function paginate(data) {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }

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

    filteredData = categorySelect.value === 'All'
      ? data
      : data.filter(d => d.category === categorySelect.value);

    filteredData.sort((a, b) => {
      const col = currentSort.column;
      let valA = a[col], valB = b[col];
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

      return (valA < valB ? -1 : valA > valB ? 1 : 0) * (currentSort.ascending ? 1 : -1);
    });

    const pageData = paginate(filteredData);

    pageData.forEach(item => {
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

    updatePaginationControls();
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
    currentPage = 1;
    renderTable();
  });

  function updatePaginationControls() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    document.getElementById('pagination-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page-btn').disabled = currentPage === 1;
    document.getElementById('next-page-btn').disabled = currentPage >= totalPages;
  }

  window.goToNextPage = () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  };

  window.goToPrevPage = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  };

  document.getElementById("open-in-tab")?.addEventListener("click", () => {
    viewerTab = window.open("viewer.html", "pdfViewerTab");
    setTimeout(() => {
      if (currentPdfPath && viewerTab) {
        viewerTab.postMessage({ type: "load-pdf", path: currentPdfPath }, "*");
      }
    }, 300);
  });

  let pdfDoc = null;
  let currentPdfPath = null;
  const canvas = document.getElementById("pdfViewer");
  const ctx = canvas?.getContext("2d");

  function openPdfDocument(path) {
    currentPdfPath = path;
    if (canvas && ctx) {
      pdfjsLib.getDocument(path).promise.then(pdf => {
        pdfDoc = pdf;
        renderPage(1);
      }).catch(err => {
        console.error("Error loading PDF:", err);
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
      const renderContext = { canvasContext: ctx, viewport };
      page.render(renderContext);
      document.getElementById("page-num").textContent = num;
      document.getElementById("page-count").textContent = pdfDoc.numPages;
    });
  }

  function attachPdfViewListeners() {
    document.querySelectorAll(".view-pdf-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const pdfPath = e.currentTarget.getAttribute("data-pdf-path");
        if (pdfPath) openPdfDocument(pdfPath);
      });
    });
  }

  populateCategories();
  attachSortListeners();
  renderTable();
});

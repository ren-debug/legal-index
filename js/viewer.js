  // --- PDF Reader Integration ---
  const pdfViewerCanvas = document.getElementById('pdfViewer');
  const pdfViewerContext = pdfViewerCanvas.getContext('2d');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageNumSpan = document.getElementById('page-num');
  const pageCountSpan = document.getElementById('page-count');

  let currentPdfDoc = null; // Stores the loaded PDF document
  let currentPageNum = 1; // Current page being viewed

  // Set the workerSrc for pdf.js (important!)
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

  // Function to render a specific page of the PDF
  async function renderPage(pageNum) {
      if (!currentPdfDoc) return;

      currentPageNum = pageNum;
      const page = await currentPdfDoc.getPage(pageNum);
      const scale = 1.5; // You can adjust the scale
      const viewport = page.getViewport({ scale });

      pdfViewerCanvas.height = viewport.height;
      pdfViewerCanvas.width = viewport.width;

      const renderContext = {
          canvasContext: pdfViewerContext,
          viewport: viewport,
      };

      await page.render(renderContext).promise;
      pageNumSpan.textContent = currentPageNum;
      updateNavigationButtons();
  }

  // Function to load and render a PDF
  async function loadAndRenderPdf(pdfUrl) {
      try {
          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          currentPdfDoc = await loadingTask.promise;
          pageCountSpan.textContent = currentPdfDoc.numPages;
          renderPage(1);
          
          // Render the first page by default
      } catch (error) {
          console.error('Error loading PDF:', error);
          pdfViewerContext.clearRect(0, 0, pdfViewerCanvas.width, pdfViewerCanvas.height); // Clear canvas
          pdfViewerContext.font = "16px Arial";
          pdfViewerContext.fillStyle = "red";
          pdfViewerContext.textAlign = "center";
          pdfViewerContext.fillText("Error loading PDF. Make sure the file exists and is valid.", pdfViewerCanvas.width / 2, pdfViewerCanvas.height / 2);
          currentPdfDoc = null; // Reset document
          pageNumSpan.textContent = 'N/A';
          pageCountSpan.textContent = 'N/A';
          updateNavigationButtons();
      }
  }

  // Update navigation button states
  function updateNavigationButtons() {
      prevPageBtn.disabled = currentPageNum <= 1;
      nextPageBtn.disabled = currentPageNum >= currentPdfDoc?.numPages;
  }

  // Navigation button event listeners
  prevPageBtn.addEventListener('click', () => {
      if (currentPageNum > 1) {
          renderPage(currentPageNum - 1);
      }
  });

  nextPageBtn.addEventListener('click', () => {
      if (currentPageNum < currentPdfDoc.numPages) {
          renderPage(currentPageNum + 1);
      }
  });

  document.getElementById('zoom-in').addEventListener('click', () => {
  currentScale = Math.min(currentScale + 0.25, 3);
  renderPage(currentPage);
});
document.getElementById('zoom-out').addEventListener('click', () => {
  currentScale = Math.max(currentScale - 0.25, 0.5);
  renderPage(currentPage);
});

  function attachPdfViewListeners() {
  document.querySelectorAll('.view-pdf-link').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pdfPath = event.currentTarget.dataset.pdfPath;
      if (pdfPath) {
        loadAndRenderPdf(pdfPath);
      }
    });
  });
}

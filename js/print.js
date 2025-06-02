
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('table-body');

  const data = [
    {
      exhibitNo: "001",
      category: "Family Law",
      type: "Court Papers",
      media: "PDF",
      date: "2024-09-10",
      author: "Applicant A",
      description: "Initial filing for family proceedings"
    },
    {
      exhibitNo: "002",
      category: "Health Impact",
      type: "Medical Records",
      media: "PDF",
      date: "2024-10-01",
      author: "Dr. B",
      description: "Health evaluation report"
    },
    {
      exhibitNo: "003",
      category: "Criminal Law",
      type: "Police Report",
      media: "PDF",
      date: "2024-11-15",
      author: "Officer C",
      description: "Report of alleged incident"
    },
    {
      exhibitNo: "004",
      category: "Financial",
      type: "Benefit Letters",
      media: "PDF",
      date: "2024-10-20",
      author: "Department X",
      description: "Benefits approval letter"
    }
  ];

  data.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.exhibitNo}</td>
      <td>${item.category}</td>
      <td>${item.type}</td>
      <td>${item.media}</td>
      <td>${item.date}</td>
      <td>${item.author}</td>
      <td>${item.description}</td>
    `;
    tableBody.appendChild(tr);
  });
});

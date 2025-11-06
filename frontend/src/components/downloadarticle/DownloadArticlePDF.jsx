import "./downloadarticle.css"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DownloadArticlePDF = ({ articleRef, title }) => {
  const handleDownloadPDF = async () => {
    const element = articleRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, useCORS: true, scrollY: -window.scrollY });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const safeTitle = title.replace(/\s+/g, "_").slice(0, 40);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    pdf.save(`${safeTitle}_${timestamp}.pdf`);

    // pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  return <button onClick={handleDownloadPDF} className="download-btn">Download as PDF</button>;
};

export default DownloadArticlePDF;

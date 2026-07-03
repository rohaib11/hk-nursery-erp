import { CheckCircle, Download, ArrowLeft, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import logo from '../../assets/logo.png';

export default function InvoiceReceipt({ invoice, onNewSale }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessSettings, setBusinessSettings] = useState(null);

  // Fetch business settings for dynamic header
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setBusinessSettings(data.settings);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const customerName = invoice.customer.name === 'Walk-in Gahak' ? 'Walk-in Customer' : invoice.customer.name;

  // 🖨️ PDF Generator (multi‑page support)
  const handleDownloadPDF = async () => {
    const receiptElement = document.getElementById('printable-receipt');
    if (!receiptElement) return;

    setIsGenerating(true);
    try {
      // 1. Capture the whole invoice as a high‑quality image
      const dataUrl = await toPng(receiptElement, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: { margin: '0' }
      });

      // 2. Create PDF and load image
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 5; // mm margins
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      // 3. Determine image dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const imgRatio = img.width / img.height;
      let imgWidth = usableWidth;
      let imgHeight = imgWidth / imgRatio;

      // If the image is shorter than one page, just place it
      if (imgHeight <= usableHeight) {
        pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        // 4. Multi‑page: slice the image vertically
        let yOffset = 0; // y‑position in the original image (in image pixels)
        let page = 0;
        const totalImgHeightPx = img.height;
        const scale = imgWidth / img.width; // conversion factor from image px to mm

        while (yOffset < totalImgHeightPx) {
          if (page > 0) pdf.addPage();

          // Calculate the slice height in image pixels that fits on one PDF page
          const maxSlicePx = Math.min(totalImgHeightPx - yOffset, usableHeight / scale);
          const sliceHeight = maxSlicePx * scale;

          // Create a temporary canvas for the slice
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = maxSlicePx;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, yOffset, img.width, maxSlicePx, 0, 0, img.width, maxSlicePx);
          const sliceDataUrl = canvas.toDataURL('image/png');

          pdf.addImage(sliceDataUrl, 'PNG', margin, margin, imgWidth, sliceHeight);

          yOffset += maxSlicePx;
          page++;
        }
      }

      pdf.save(`HK_Nursery_Invoice_${invoice.id}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const money = (n) => new Intl.NumberFormat("en-PK").format(Number(n) || 0);

  // 📱 WhatsApp message
  const sendWhatsApp = () => {
    let message = `*${businessSettings?.nursery_name || 'HK NURSERY'}*\n`;
    message += `Date: ${new Date().toLocaleDateString('en-GB')}\n`;
    message += `Invoice #: ${invoice.id}\n`;
    message += `Customer: *${customerName}*\n\n`;
    
    message += `*--- Item Details ---*\n`;
    invoice.cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Qty: ${item.quantity} x Rs ${item.unit_price} = Rs ${item.quantity * item.unit_price}\n`;
    });
    
    message += `\n*--- Bill Summary ---*\n`;
    message += `Subtotal: Rs ${invoice.totals.subtotal}\n`;
    if (invoice.totals.extra > 0) message += `Labor/Loading: +Rs ${invoice.totals.extra}\n`;
    if (invoice.totals.discount > 0) message += `Discount: -Rs ${invoice.totals.discount}\n`;
    message += `\n*Total Bill: Rs ${invoice.totals.totalAmount}*\n`;
    message += `Amount Paid: Rs ${invoice.totals.paid}\n`;
    if (invoice.totals.udhaar > 0) message += `*Balance Due: Rs ${invoice.totals.udhaar}*\n`;
    message += `\nThank you for your business!`;

    const encodedMessage = encodeURIComponent(message);
    let waUrl = `https://wa.me/?text=${encodedMessage}`;
    if (invoice.customer.phone) {
      const cleanPhone = invoice.customer.phone.replace(/\D/g, '');
      waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }
    window.open(waUrl, '_blank');
  };

  // Use dynamic settings or fallback
  const nurseryName = businessSettings?.nursery_name || 'HK NURSERY';
  const nurseryAddress = businessSettings?.address || 'Pattoki, Punjab, Pakistan';
  const phone1 = businessSettings?.phone1 || '+92 300 1234567';
  const phone2 = businessSettings?.phone2 || '+92 300 7654321';

  return (
    <div className="flex flex-col xl:flex-row items-start justify-center gap-8 h-full animate-fade-in pb-10 overflow-y-auto">
      
      {/* LEFT SIDE: SUCCESS & ACTIONS */}
      <div className="text-center xl:sticky xl:top-10 w-full xl:w-1/3 bg-[#111827]/80 p-8 rounded-3xl border border-slate-700/50 shadow-xl backdrop-blur-md">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
          <CheckCircle className="text-emerald-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Checkout Complete!</h2>
        <p className="text-slate-400 text-sm mb-8">Invoice #{invoice.id} has been saved.</p>
        
        <div className="flex flex-col gap-4">
          <button onClick={handleDownloadPDF} disabled={isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all">
            <Download size={20} /> 
            {isGenerating ? 'Generating PDF...' : 'Download A4 PDF Bill'}
          </button>
          <button onClick={sendWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all">
            <MessageCircle size={20} /> Send via WhatsApp
          </button>
          <div className="h-px w-full bg-slate-800 my-2"></div>
          <button onClick={onNewSale}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all">
            <ArrowLeft size={20} /> Return to POS / Next Customer
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: INVOICE PREVIEW (scrollable, whole content captured for PDF) */}
      <div className="w-full xl:w-2/3 overflow-x-auto pb-8">
        <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
          <span>Live Document Preview</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div id="printable-receipt" className="bg-white text-black font-sans shadow-2xl"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "15mm",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* HEADER - Reduced sizes */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">{nurseryName}</h1>
                <p className="text-xs text-gray-600 font-medium mt-0.5">{nurseryAddress}</p>
                <div className="mt-2 text-xs font-bold text-gray-700 bg-gray-100 p-1.5 rounded inline-block border border-gray-300">
                  <p className="flex items-center gap-1">📞 {phone1}</p>
                  <p className="flex items-center gap-1 mt-0.5">📞 {phone2}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-400 mb-2">INVOICE</h2>
              <div className="text-xs bg-gray-50 border border-gray-300 p-2 rounded text-left inline-block min-w-[140px]">
                <p className="mb-0.5"><strong className="text-gray-700">No:</strong> <span className="float-right font-bold text-sm">#{invoice.id}</span></p>
                <p><strong className="text-gray-700">Date:</strong> <span className="float-right">{new Date().toLocaleDateString('en-GB')}</span></p>
              </div>
            </div>
          </div>

          {/* CUSTOMER BOX - Smaller */}
          <div className="border border-gray-400 p-3 mb-6 rounded bg-gray-50">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Bill To (Customer Account):</p>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">{customerName}</h3>
          </div>

          {/* ITEMS TABLE (unchanged, but without fixed min‑height so it can grow) */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-2 px-3 uppercase text-xs font-bold w-8 text-center border border-gray-800">#</th>
                  <th className="py-2 px-3 uppercase text-xs font-bold border border-gray-800">Item Description</th>
                  <th className="py-2 px-3 uppercase text-xs font-bold text-center w-20 border border-gray-800">Qty</th>
                  <th className="py-2 px-3 uppercase text-xs font-bold text-right w-24 border border-gray-800">Rate</th>
                  <th className="py-2 px-3 uppercase text-xs font-bold text-right w-28 border border-gray-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.cart.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="py-2 px-3 text-center border-l border-r border-gray-300 text-gray-600 text-sm">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-gray-300 text-sm font-medium">{item.name}</td>
                    <td className="py-2 px-3 text-center text-sm border-r border-gray-300">{item.quantity}</td>
                    <td className="py-2 px-3 text-right text-sm text-gray-600 border-r border-gray-300">{money(item.unit_price)}</td>
                    <td className="py-2 px-3 text-right text-sm font-bold border-r border-gray-300">{money(item.unit_price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="flex justify-end mb-8">
            <div className="w-72 border border-gray-400 rounded overflow-hidden">
              <div className="p-3 space-y-1 text-sm border-b border-gray-300 bg-gray-50">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span className="font-medium">Rs {money(invoice.totals.subtotal)}</span></div>
                {invoice.totals.extra > 0 && <div className="flex justify-between"><span className="text-gray-600">Labor/Loading:</span> <span className="font-medium">+ Rs {money(invoice.totals.extra)}</span></div>}
                {invoice.totals.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount:</span> <span>- Rs {money(invoice.totals.discount)}</span></div>}
              </div>
              <div className="p-3 bg-gray-800 text-white flex justify-between font-bold text-base">
                <span>Total Bill:</span> <span>Rs {money(invoice.totals.totalAmount)}</span>
              </div>
              <div className="p-3 bg-white border-t border-gray-300 text-sm">
                <div className="flex justify-between font-semibold text-gray-700">
                  <span>Paid:</span> <span>Rs {money(invoice.totals.paid)}</span>
                </div>
                {invoice.totals.udhaar > 0 && (
                  <div className="flex justify-between font-semibold mt-1 pt-1 border-t border-dashed border-gray-400">
                    <span className="text-gray-900">Balance Due:</span> <span>Rs {money(invoice.totals.udhaar)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIGNATURE FOOTER – always at the end */}
          <div className="mt-10 pt-6 border-t-2 border-gray-800 flex justify-between items-end px-4">
            <div className="text-center">
              <div className="w-40 border-b-2 border-black mb-1"></div>
              <p className="font-bold text-gray-700 uppercase text-xs">Customer Signature</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b-2 border-black mb-1"></div>
              <p className="font-bold text-gray-700 uppercase text-xs">Authorized Signature</p>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-gray-500 italic">
            System Generated Invoice – Keep for your records
          </div>
        </div>
      </div>
    </div>
  );
}
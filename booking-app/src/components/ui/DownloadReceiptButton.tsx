"use client";
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas'; // Import directly
import jsPDF from 'jspdf'; // Import directly

interface DownloadReceiptButtonProps {
    targetId: string;
    fileName?: string;
}

export function DownloadReceiptButton({ targetId, fileName = 'receipt' }: DownloadReceiptButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsGenerating(true);

        try {
            // Wait a moment for any fonts/images to be fully ready if needed
            // Use html2canvas to capture the element
            const canvas = await html2canvas(element, {
                useCORS: true, // Handle external images if any
                backgroundColor: '#ffffff', // Ensure white background
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate PDF dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 text-gold-500 hover:text-gold-400 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    <span>Download Receipt</span>
                </>
            )}
        </button>
    );
}

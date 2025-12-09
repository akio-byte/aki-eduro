import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Helper to sanitize text for PDF (removes emojis and unsupported chars that crash pdf-lib standard fonts)
 */
const sanitizeText = (text: string): string => {
  if (!text) return "";
  // Keep basic Latin, numbers, punctuation, and Finnish chars (äöåÄÖÅ)
  // Also include colon, hyphen, parens
  return text.replace(/[^\w\s\d.,!?'"äöåÄÖÅ\-:()]/g, ' ').trim();
};

export const generateCertificatePdf = async (
  name: string,
  level: string,
  score: number,
  elfText: string,
  summary: string, // New summary field
  imageDataUrl: string,
  badgeImageUrl: string
): Promise<string> => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Colors
    const primaryColor = rgb(0.84, 0.16, 0.16); // #d62828 Red
    const darkColor = rgb(0.2, 0.2, 0.2);

    // --- Header ---
    page.drawText('Eduro Pikkujoulut', {
      x: 50,
      y: height - 60,
      size: 18,
      font: font,
      color: darkColor,
    });

    page.drawText('Joulun Osaaja -todistus', {
      x: 50,
      y: height - 100,
      size: 30,
      font: fontBold,
      color: primaryColor,
    });

    // Date
    const dateStr = new Date().toLocaleDateString('fi-FI');
    page.drawText(dateStr, {
      x: width - 150,
      y: height - 60,
      size: 12,
      font,
      color: darkColor,
    });

    // --- User Info ---
    const safeName = sanitizeText(name);
    page.drawText(`Nimi: ${safeName}`, {
      x: 50,
      y: height - 160,
      size: 18,
      font: fontBold,
      color: darkColor,
    });

    const safeLevel = sanitizeText(level);
    page.drawText(`Titteli: ${safeLevel}`, {
      x: 50,
      y: height - 190,
      size: 16,
      font: font,
      color: primaryColor,
    });

    // --- Elf Portrait (Left Side) ---
    let finalImageY = height - 250;
    try {
      const imageBytes = await fetch(imageDataUrl).then((res) => res.arrayBuffer());
      const uint8Array = new Uint8Array(imageBytes);
      
      let embeddedImage;

      // Check Magic Bytes
      if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
          // Fallback based on string detection if bytes fail
          if (imageDataUrl.includes('image/jpeg') || imageDataUrl.includes('image/jpg')) {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } else {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          }
      }
      
      const imgDims = embeddedImage.scale(0.5);
      const scaleFactor = 300 / imgDims.width;
      const finalDims = embeddedImage.scale(scaleFactor);

      finalImageY = height - 230 - finalDims.height;

      page.drawImage(embeddedImage, {
        x: 50,
        y: finalImageY,
        width: finalDims.width,
        height: finalDims.height,
      });

    } catch (err) {
      console.error("Error embedding elf image in PDF", err);
      page.drawText('(Kuvaa ei voitu liittää)', { x: 50, y: height - 300, size: 12, font, color: darkColor });
    }

    // --- Open Badge Image (Right Side) ---
    try {
      const badgeBytes = await fetch(badgeImageUrl).then((res) => res.arrayBuffer());
      const embeddedBadge = await pdfDoc.embedPng(badgeBytes);
      const badgeDims = embeddedBadge.scaleToFit(120, 120);

      page.drawImage(embeddedBadge, {
        x: 380, 
        y: height - 350,
        width: badgeDims.width,
        height: badgeDims.height,
      });

      page.drawText('Myönnetty merkki:', {
        x: 380,
        y: height - 365,
        size: 10,
        font: fontBold,
        color: darkColor,
      });
      page.drawText('Jouluosaaja', {
        x: 380,
        y: height - 380,
        size: 12,
        font: font,
        color: primaryColor,
      });

    } catch (err) {
      console.error("Error embedding badge image", err);
    }

    // --- Summary & Description ---
    const textStartY = finalImageY - 40;
    
    // Summary line
    const safeSummary = sanitizeText(summary);
    page.drawText(safeSummary, {
      x: 50,
      y: textStartY,
      size: 14,
      font: fontOblique, // Italic for summary
      color: primaryColor,
    });

    // Main Analysis header
    page.drawText('Tonttuanalyysi:', {
      x: 50,
      y: textStartY - 30,
      size: 14,
      font: fontBold,
      color: primaryColor,
    });

    // Word wrap for main text
    const safeElfText = sanitizeText(elfText);
    const words = safeElfText.split(' ');
    let line = '';
    let yOffset = textStartY - 55;
    const maxWidth = 500;

    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, 12);
      if (textWidth > maxWidth) {
        page.drawText(line, { x: 50, y: yOffset, size: 12, font, color: darkColor });
        line = word + ' ';
        yOffset -= 18;
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x: 50, y: yOffset, size: 12, font, color: darkColor });

    // Save
    const pdfBytes = await pdfDoc.save();
    const base64Pdf = btoa(
      new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:application/pdf;base64,${base64Pdf}`;

  } catch (error) {
    console.error("PDF Generation Error", error);
    throw error;
  }
};
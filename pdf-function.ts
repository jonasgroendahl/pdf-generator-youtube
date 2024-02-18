import PDFDocument from "pdfkit";

export const handler = async () => {
  const createPdf = async (): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 20,
        // bufferPages: true,
      });

      const buffers: any = [];

      doc.on("data", (chunk) => {
        buffers.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.fontSize(14);

      doc.text("Hello World!").text("John doe!");

      doc.end();
    });
  };

  const pdf = await createPdf();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=example.pdf",
    },
    body: pdf.toString("base64"),
    isBase64Encoded: true,
  };
};

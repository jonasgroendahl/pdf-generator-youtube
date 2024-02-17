import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import * as PDFDocument from "pdfkit";

// A Lambda function to invoke
const fn = new aws.lambda.CallbackFunction("fn", {
  callback: async (ev, ctx) => {
    return {
      statusCode: 200,
      body: new Date().toISOString(),
    };
  },
});

const pdfFn = new aws.lambda.CallbackFunction("pdfFn", {
  memorySize: 512,
  callback: async (ev, ctx) => {
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
  },
});

// A REST API to route requests to HTML content and the Lambda function
const api = new apigateway.RestAPI("api", {
  routes: [
    { path: "/", localPath: "www" },
    { path: "/date", method: "GET", eventHandler: fn },
    { path: "/pdf", method: "GET", eventHandler: pdfFn },
  ],
});

// The URL at which the REST API will be served.
export const url = api.url;

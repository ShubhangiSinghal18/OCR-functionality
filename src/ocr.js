import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import { Box, Button, Typography } from "@mui/material";

const BillOCR = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [billDetails, setBillDetails] = useState({});

  // Dropzone setup for accepting only 1 image file
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setExtractedText("");
      setBillDetails({});
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxFiles: 1,
  });

  // Function to extract text from image
  const handleExtractText = async () => {
    if (!image) return;

    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng");
      setExtractedText(text);
      extractBillDetails(text);
    } catch (error) {
      console.error("Error extracting text:", error);
    }
  };

  // Extract specific details from OCR text
  const extractBillDetails = (text) => {
    const billNumberMatch = text.match(/Bill Number[:\s]+(\d+)/i);
    const dueDateMatch = text.match(/Due Date[:\s]+([\w-]+)/i);
    const amountMatch = text.match(/Total Amount[:\s]+₹?([\d,.]+)/i);
    const payeeMatch = text.match(/Payee Name[:\s]+(.+)/i);

    setBillDetails({
      billNumber: billNumberMatch ? billNumberMatch[1] : "Not Found",
      dueDate: dueDateMatch ? dueDateMatch[1] : "Not Found",
      totalAmount: amountMatch ? `₹${amountMatch[1]}` : "Not Found",
      payeeName: payeeMatch ? payeeMatch[1] : "Not Found",
    });
  };

  return (
    <Box sx={{ textAlign: "center", p: 3 }}>
      {/* Dropzone for uploading image */}
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed gray",
          padding: "20px",
          cursor: "pointer",
          marginBottom: 2,
        }}
      >
        <input {...getInputProps()} />
        <Typography>Drag & Drop a bill image here, or click to select one</Typography>
      </Box>

      {/* Display uploaded image preview */}
      {image && <img src={image} alt="Uploaded" style={{ maxWidth: "100%", height: "auto", marginBottom: "10px" }} />}

      {/* Extract button */}
      <Button variant="contained" color="primary" onClick={handleExtractText} disabled={!image}>
        Extract Bill Details
      </Button>

      {/* Display extracted details */}
      {extractedText && (
        <Box sx={{ textAlign: "left", marginTop: 2 }}>
          <Typography variant="h6">Extracted Details:</Typography>
          <Typography><strong>Bill Number:</strong> {billDetails.billNumber}</Typography>
          <Typography><strong>Due Date:</strong> {billDetails.dueDate}</Typography>
          <Typography><strong>Total Amount:</strong> {billDetails.totalAmount}</Typography>
          <Typography><strong>Payee Name:</strong> {billDetails.payeeName}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default BillOCR;
